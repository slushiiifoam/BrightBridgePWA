import express from 'express';
import { z } from 'zod';

import {auth_service} from '../services/setupService.js'

const router = express.Router();

// 1. Zod Schema for Request Body Validation
const getJwtSchema = z.object({
  email: z.string().email(),
});

// Helper function for logging activity asynchronously (equivalent to FastAPI BackgroundTasks)
const logUserActivity = (email, action) => {
  setImmediate(() => {
    console.log(`[${new Date().toISOString()}]: User ${email} has ${action}`);
  });
};

// Common cookie configuration
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
};

/**
 * Route for logging in users and issuing initial JWT & Refresh Token cookies
 * POST /api/auth/getJWTTokens
 */
router.post('/getJWTTokens', async (req, res) => {
  try {
    // Validate request body
    const { email } = getJwtSchema.parse(req.body);

    // Generate Access Token
    const jwt = auth_service.createJwt(email);

    // Run background task non-blockingly
    logUserActivity(email, 'SUCCESSFUL LOGIN');

    // Set access_token cookie (1800 seconds = 1,800,000 ms)
    res.cookie('access_token', jwt, {
      ...cookieOptions,
      maxAge: 1800 * 1000,
    });

    // Create and save refresh token UUID hash
    const userUuid = await auth_service.createRefreshUuid(email);

    // Set refresh_token cookie (604800 seconds = 604,800,000 ms)
    // Preserving original typo cookie name compatibility (refresh_token / refresponseh_token)
    res.cookie('refresh_token', userUuid, {
      ...cookieOptions,
      maxAge: 604800 * 1000,
    });

    return res.status(200).json({ detail: 'users successfully authenticated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ detail: 'Invalid input parameters', errors: error.errors });
    }
    return res.status(401).json({ detail: error.message || 'Authentication failed' });
  }
});

/**
 * Route for refreshing tokens using the existing refresh cookie
 * GET /api/auth/refresh (or /api/auth/refresponseh for legacy endpoint match)
 */
const handleRefresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refresh_token || req.cookies?.refresponseh_token;

    console.log(`refresh token is ${refreshToken}`);

    if (!refreshToken) {
      return res.status(401).json({ detail: 'Missing refresh token' });
    }

    // Issue new JWT using the existing refresh token
    const jwt = await auth_service.refreshJwt(refreshToken);

    // Set updated access_token cookie
    res.cookie('access_token', jwt, {
      ...cookieOptions,
      maxAge: 1800 * 1000,
    });

    // Rotate and get new refresh UUID
    const newUuid = await auth_service.refreshUuid(refreshToken);

    // Set updated refresh_token cookie
    res.cookie('refresh_token', newUuid, {
      ...cookieOptions,
      maxAge: 604800 * 1000,
    });

    return res.status(200).json({ detail: 'successfully refreshed token' });
  } catch (error) {
    return res.status(401).json({ detail: error.message || 'Invalid refresh request' });
  }
};

// Registered on both path names for endpoint compatibility
router.get('/refresh', handleRefresh);
router.get('/refresponseh', handleRefresh);

export default router;