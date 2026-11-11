import jwt from 'jsonwebtoken';
import { settings } from '../config/settings.js';

/**
 * Class for managing JWT generation, decoding, and authentication middleware
 */
export class JwtManager {
  /**
   * Constructor
   * @param {object} userDatabase Instance of SupabaseRepository or DB client
   */
  constructor(userDatabase) {
    this.secretKey = settings.SECRET_KEY;
    this.hashAlgorithm = settings.HASH_ALGORITHM; // e.g., 'HS256'
    this.userDatabase = userDatabase;
  }

  /**
   * Creates a JWT access token for the user
   * @param {string} username 
   * @param {number} [duration=30] Expiration time in minutes
   * @returns {{ access_token: string, token_type: string }}
   */
  createAccessToken(username, duration = 30) {
    const payload = { sub: username };

    const encodedJwt = jwt.sign(payload, this.secretKey, {
      algorithm: this.hashAlgorithm,
      expiresIn: `${duration}m`,
    });

    return {
      access_token: encodedJwt,
      token_type: 'bearer',
    };
  }

  /**
   * Decodes and verifies the JWT
   * @param {string} token 
   * @returns {object|null}
   */
  decode(token) {
    try {
      return jwt.verify(token, this.secretKey, {
        algorithms: [this.hashAlgorithm],
      });
    } catch (err) {
      return null;
    }
  }

  /**
   * Checks whether a JWT is valid and returns user UUID if found
   * @param {string} token 
   * @returns {Promise<string|null>}
   */
  async isValidJwt(token) {
    const decodedToken = this.decode(token);
    if (!decodedToken || !decodedToken.sub) {
      return null;
    }

    const decodedEmail = decodedToken.sub;

    // Searching user database using async Supabase search
    const users = await this.userDatabase.search('users', 'uuid', 'email', decodedEmail);

    if (!users || users.length === 0) {
      return null;
    }

    return users[0].uuid;
  }

  /**
   * Express Middleware equivalent to FastAPI's Depends(get_current_user)
   * Attaches the authenticated user to `req.user`
   */
  getCurrentUserMiddleware() {
    return async (req, res, next) => {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          detail: 'Could not validate credentials',
          headers: { 'WWW-Authenticate': 'Bearer' },
        });
      }

      const token = authHeader.split(' ')[1];
      const payload = this.decode(token);

      if (!payload || !payload.sub) {
        return res.status(401).json({
          detail: 'Could not validate credentials',
          headers: { 'WWW-Authenticate': 'Bearer' },
        });
      }

      const username = payload.sub;

      try {
        const users = await this.userDatabase.search('users', '*', 'email', username);
        const user = users && users.length > 0 ? users[0] : null;

        if (!user) {
          return res.status(401).json({
            detail: 'Could not validate credentials',
            headers: { 'WWW-Authenticate': 'Bearer' },
          });
        }

        // Attach authenticated user to request object
        req.user = user;
        next();
      } catch (error) {
        return res.status(401).json({
          detail: 'Could not validate credentials',
          headers: { 'WWW-Authenticate': 'Bearer' },
        });
      }
    };
  }
}