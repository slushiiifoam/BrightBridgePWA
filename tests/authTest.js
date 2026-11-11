import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';

// 1. Import your auth router and service singleton
import authRouter from '../app/routes/auth.js';
import { authService } from '../app/services/index.js';

// 2. Setup the test Express application instance
const app = express();
app.use(express.json());
app.use(cookieParser());

// Wire route under test
app.use('/api/auth', authRouter);

describe('Auth & Token Refresh Flow Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test run
    vi.restoreAllMocks();
  });

  it('should authenticate user, issue cookies, and allow refresh after access_token removal', async () => {
    const testEmail = 'ijiang2@asu.edu';
    const mockUser = { email: testEmail, refresh_token: 'hashed_uuid_string' };

    // --- Mock Database Operations ---
    // Mock user lookup for createRefreshUuid / confirmUuid
    vi.spyOn(authService.db, 'search').mockResolvedValue([mockUser]);
    // Mock user update for storing refresh token hash
    vi.spyOn(authService.db, 'update').mockResolvedValue(true);

    // ==========================================
    // STEP 1: Login to get initial JWT & Refresh Token
    // ==========================================
    const loginResponse = await request(app)
      .post('/api/auth/getJWTTokens')
      .send({ email: testEmail });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.detail).toBe('users successfully authenticated');

    // Extract Set-Cookie headers
    const setCookieHeaders = loginResponse.headers['set-cookie'];
    expect(setCookieHeaders).toBeDefined();

    // Parse returned cookies into a dictionary
    const cookies = {};
    setCookieHeaders.forEach((cookieStr) => {
      const [pair] = cookieStr.split(';');
      const [key, val] = pair.split('=');
      cookies[key.trim()] = val.trim();
    });

    // Verify both tokens were generated and set in cookies
    expect(cookies.access_token).toBeDefined();
    const refreshToken = cookies.refresh_token || cookies.refresponseh_token;
    expect(refreshToken).toBeDefined();

    // ==========================================
    // STEP 2: Simulate Expired Session (Remove access_token)
    // ==========================================
    delete cookies.access_token;
    expect(cookies.access_token).toBeUndefined();

    // Format remaining refresh cookie for the next HTTP request header
    const refreshCookieHeader = `refresh_token=${refreshToken}`;

    // ==========================================
    // STEP 3: Request New Tokens via Refresh Endpoint
    // ==========================================
    const refreshResponse = await request(app)
      .get('/api/auth/refresh')
      .set('Cookie', [refreshCookieHeader]);

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.detail).toBe('successfully refreshed token');

    // Verify new cookies were re-issued
    const refreshedCookieHeaders = refreshResponse.headers['set-cookie'];
    expect(refreshedCookieHeaders).toBeDefined();

    const refreshedCookies = {};
    refreshedCookieHeaders.forEach((cookieStr) => {
      const [pair] = cookieStr.split(';');
      const [key, val] = pair.split('=');
      refreshedCookies[key.trim()] = val.trim();
    });

    // Verify that access_token was successfully regenerated
    expect(refreshedCookies.access_token).toBeDefined();
    expect(refreshedCookies.refresh_token || refreshedCookies.refresponseh_token).toBeDefined();
  });

  it('should reject refresh requests if refresh_token cookie is missing', async () => {
    const response = await request(app).get('/api/auth/refresh');

    expect(response.status).toBe(401);
    expect(response.body.detail).toBe('Missing refresh token');
  });
});