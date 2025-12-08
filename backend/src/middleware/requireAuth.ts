/**
 * JWT Authentication Middleware
 * 
 * Validates JWT tokens in the Authorization header.
 * Attaches decoded payload to req.user for downstream handlers.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

/**
 * Shape of the JWT payload for authenticated users.
 */
export interface AuthPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Extend Express Request to include user payload.
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/**
 * Middleware to require a valid JWT in the Authorization header.
 * Expects: "Bearer <token>"
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    res.status(401).json({ 
      ok: false, 
      error: 'Missing authorization header',
      code: 'MISSING_AUTH_HEADER',
    });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ 
      ok: false, 
      error: 'Invalid authorization format. Expected: Bearer <token>',
      code: 'INVALID_AUTH_FORMAT',
    });
    return;
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch (err) {
    // Don't log the token or detailed error to prevent info leakage
    const errorCode = err instanceof jwt.TokenExpiredError 
      ? 'TOKEN_EXPIRED' 
      : 'INVALID_TOKEN';
    
    res.status(401).json({ 
      ok: false, 
      error: errorCode === 'TOKEN_EXPIRED' ? 'Token expired' : 'Invalid token',
      code: errorCode,
    });
    return;
  }
}
