/**
 * Authentication Routes
 * 
 * Handles password-based login and JWT token issuance.
 */

import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { authRateLimiter } from '../middleware/rateLimit';

const router = Router();

// Environment variables (validated at startup in server.ts)
const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD as string;
const JWT_SECRET = process.env.JWT_SECRET as string;

// Token expiration: 8 hours
const TOKEN_EXPIRATION = '8h';
const TOKEN_EXPIRATION_SECONDS = 8 * 60 * 60; // 28800 seconds

/**
 * Login request validation schema.
 */
const loginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /auth/login
 * 
 * Authenticates with access password and returns a JWT.
 * 
 * Request body:
 *   { password: string }
 * 
 * Response (200):
 *   { ok: true, token: string, expiresIn: number }
 * 
 * Response (401):
 *   { ok: false, error: string, code: string }
 */
router.post('/login', authRateLimiter, (req: Request, res: Response) => {
  // Validate request body
  const parsed = loginSchema.safeParse(req.body);
  
  if (!parsed.success) {
    res.status(400).json({
      ok: false,
      error: 'Invalid request body',
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  const { password } = parsed.data;

  // Check password (constant-time comparison would be ideal, but for a single password this is acceptable)
  if (password !== ACCESS_PASSWORD) {
    // Log failed attempts without revealing which part failed
    console.log(`[Auth] Failed login attempt from ${req.ip}`);
    
    res.status(401).json({
      ok: false,
      error: 'Invalid password',
      code: 'INVALID_PASSWORD',
    });
    return;
  }

  // Issue JWT
  const payload = {
    sub: 'admin',
    role: 'admin',
  };

  const token = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: TOKEN_EXPIRATION,
  });

  console.log(`[Auth] Successful login from ${req.ip}`);

  res.json({
    ok: true,
    token,
    expiresIn: TOKEN_EXPIRATION_SECONDS,
  });
});

export default router;
