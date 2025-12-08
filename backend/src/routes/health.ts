/**
 * Health check route.
 * 
 * Used by Render (and other platforms) to verify the service is running.
 */

import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /health
 * 
 * Returns the health status of the service.
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
