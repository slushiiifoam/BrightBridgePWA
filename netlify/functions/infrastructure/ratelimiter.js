import { rateLimit } from 'express-rate-limit';

/**
 * rate limiter to prevent DDOS attacks
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  limit: 100,               // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  statusCode: 429,          // Standard HTTP status code for rate limiting
  standardHeaders: 'draft-8', // Return standard rate limit info in headers
  legacyHeaders: false,     // Disable X-RateLimit-* headers
});

export default limiter;