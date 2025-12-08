/**
 * Rate Limiting Middleware
 * 
 * Prevents abuse by limiting requests per IP address.
 * Configuration is controlled via environment variables.
 */

import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// Parse configuration from environment with defaults
const WINDOW_SEC = Number(process.env.RATE_LIMIT_WINDOW_SEC || 60);
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQ || 30);

/**
 * Rate limiter for protected API routes.
 * 
 * Default: 30 requests per 60 seconds per IP.
 */
export const apiRateLimiter = rateLimit({
  windowMs: WINDOW_SEC * 1000,
  max: MAX_REQUESTS,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    ok: false,
    error: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  keyGenerator: (req: Request) => {
    // Use X-Forwarded-For if behind a proxy (like Render), otherwise use IP
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() 
      || req.ip 
      || 'unknown';
  },
});

/**
 * Stricter rate limiter for auth routes to prevent brute force attacks.
 * 
 * Default: 5 requests per 60 seconds per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: WINDOW_SEC * 1000,
  max: 5, // Much stricter for login attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'Too many login attempts. Please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
  keyGenerator: (req: Request) => {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() 
      || req.ip 
      || 'unknown';
  },
});
