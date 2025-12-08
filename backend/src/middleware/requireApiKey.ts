/**
 * API Key Middleware
 * 
 * Validates X-API-Key header against the configured API_KEY_FRONTEND.
 * This adds an extra layer of security beyond JWT authentication.
 */

import { Request, Response, NextFunction } from 'express';

const API_KEY_FRONTEND = process.env.API_KEY_FRONTEND;

/**
 * Middleware to require a valid API key in the X-API-Key header.
 */
export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.header('X-API-Key');

  if (!apiKey) {
    res.status(401).json({ 
      ok: false, 
      error: 'Missing API key',
      code: 'MISSING_API_KEY',
    });
    return;
  }

  if (apiKey !== API_KEY_FRONTEND) {
    res.status(401).json({ 
      ok: false, 
      error: 'Invalid API key',
      code: 'INVALID_API_KEY',
    });
    return;
  }

  next();
}
