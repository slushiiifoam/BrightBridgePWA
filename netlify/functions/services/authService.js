import crypto from 'crypto';
import { settings } from '../config/settings.js';

/**
 * Class that manages authentication operations, UUID hashing, and JWT tokens
 */
export class AuthService {
  /**
   * Constructor for AuthService
   * @param {import('../api/infrastructure/supabaseRepository.js').SupabaseRepository} db 
   * @param {import('../api/infrastructure/jwtManager.js').JwtManager} jwtManager 
   */
  constructor(db, jwtManager) {
    this.db = db;
    this.jwtManager = jwtManager;
    this.roleSet = new Set(['admin', 'editor']);
  }

  /**
   * Hashes a raw UUID string into a fast 64-character SHA-256 hex string.
   * @param {string} plainUuid 
   * @returns {string}
   */
  hashUuid(plainUuid) {
    return crypto.createHash('sha256').update(plainUuid, 'utf8').digest('hex');
  }

  /**
   * Verifies a raw UUID against its SHA-256 hash in constant time.
   * @param {string} plainUuid 
   * @param {string} hashedUuid 
   * @returns {boolean}
   */
  verifyUuid(plainUuid, hashedUuid) {
    const computedHash = this.hashUuid(plainUuid);
    const a = Buffer.from(computedHash, 'utf8');
    const b = Buffer.from(hashedUuid, 'utf8');

    // Prevent length timing leaks before running timingSafeEqual
    if (a.length !== b.length) {
      return false;
    }

    return crypto.timingSafeEqual(a, b);
  }

  /**
   * Checks if the user has the specified role
   * @param {string} username (or UUID)
   * @param {string} role 
   * @returns {Promise<boolean>}
   */
  async confirmRole(username, role) {
    if (!this.roleSet.has(role)) {
      throw new Error('Invalid role');
    }

    const users = await this.db.search(`${role}s`, '*', 'uuid', username);
    return Array.isArray(users) && users.length > 0 && users[0] !== null;
  }

  /**
   * Creates a JWT for a user
   * @param {string} email 
   * @returns {string} Access token string
   */
  createJwt(email) {
    const normalizedEmail = email.strip ? email.strip().toLowerCase() : email.trim().toLowerCase();
    const tokenObj = this.jwtManager.createAccessToken(
      normalizedEmail,
      settings.ACCESS_TOKEN_EXPIRE_MINUTES
    );
    return tokenObj.access_token;
  }

  /**
   * Delegates JWT validation to JwtManager
   * @param {string} jwt 
   * @returns {Promise<string|null>}
   */
  async isValidJwt(jwt) {
    return await this.jwtManager.isValidJwt(jwt);
  }

  /**
   * Creates a refresh UUID and stores its hash for the user
   * @param {string} email 
   * @returns {Promise<string>} Plain refresh UUID
   */
  async createRefreshUuid(email) {
    const normalizedEmail = email.trim().toLowerCase();
    const users = await this.db.search('users', 'email', 'email', normalizedEmail);

    if (!users || users.length === 0) {
      throw new Error('User not found');
    }

    const refreshUuid = crypto.randomUUID();
    const hashedUuid = this.hashUuid(refreshUuid);

    await this.db.update('users', 'email', normalizedEmail, { refresh_token: hashedUuid });
    return refreshUuid;
  }

  /**
   * Refreshes a new UUID for a user given an old one
   * @param {string} oldUuid 
   * @returns {Promise<string>} New plain UUID
   */
  async refreshUuid(oldUuid) {
    const hashedOldUuid = this.hashUuid(oldUuid);

    const newUuid = crypto.randomUUID();
    const hashedNewUuid = this.hashUuid(newUuid);

    const updated = await this.db.update('users', 'refresh_token', hashedOldUuid, {
      refresh_token: hashedNewUuid,
    });

    if (updated) {
      return newUuid;
    }

    throw new Error('invalid request');
  }

  /**
   * Confirms whether a UUID is valid and returns the associated user's email
   * @param {string} uuid 
   * @returns {Promise<string>} User email
   */
  async confirmUuid(uuid) {
    const hashedOldUuid = this.hashUuid(uuid);

    const users = await this.db.search('users', 'email', 'refresh_token', hashedOldUuid);

    if (!users || users.length === 0) {
      throw new Error('invalid request');
    }

    return users[0].email;
  }

  /**
   * Creates a new JWT for a user if the refresh UUID is valid
   * @param {string} refreshToken 
   * @returns {Promise<string>} New access token string
   */
  async refreshJwt(refreshToken) {
    if (!refreshToken) {
      throw new Error('invalid request');
    }

    const confirmedEmail = await this.confirmUuid(refreshToken);

    const tokenObj = this.jwtManager.createAccessToken(
      confirmedEmail,
      settings.ACCESS_TOKEN_EXPIRE_MINUTES
    );

    return tokenObj.access_token;
  }
}