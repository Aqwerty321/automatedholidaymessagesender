/**
 * Holiday Email Orchestrator - Backend API Server
 * 
 * This Express server provides API endpoints for logging email batches
 * sent via the n8n webhook. It stores data in a Postgres database using Prisma.
 * 
 * Security:
 * - Password-based login with JWT issuance
 * - JWT + API Key required for protected routes
 * - Rate limiting to prevent abuse
 */

import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';

import healthRouter from './routes/health';
import emailLogsRouter from './routes/emailLogs';
import authRouter from './routes/auth';
import { requireApiKey } from './middleware/requireApiKey';
import { requireAuth } from './middleware/requireAuth';
import { apiRateLimiter } from './middleware/rateLimit';

// =============================================================================
// Environment Validation
// =============================================================================

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.error('   Set it in .env file or via environment variables');
  process.exit(1);
}

// Security environment variables - fail fast if missing
const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD;
if (!ACCESS_PASSWORD) {
  console.error('❌ ACCESS_PASSWORD environment variable is required');
  console.error('   This is the password users enter to access the application');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is required');
  console.error('   Generate a secure random string (min 32 characters)');
  process.exit(1);
}

const API_KEY_FRONTEND = process.env.API_KEY_FRONTEND;
if (!API_KEY_FRONTEND) {
  console.error('❌ API_KEY_FRONTEND environment variable is required');
  console.error('   This key must match VITE_API_KEY_FRONTEND in the frontend');
  process.exit(1);
}

const PORT = parseInt(process.env.PORT || '4000', 10);

// =============================================================================
// Express App Setup
// =============================================================================

const app: Express = express();

// Trust proxy for rate limiting behind Render/Vercel
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  // In production, you may want to restrict this to specific origins
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));

app.use(express.json({ limit: '1mb' }));

// Request logging (simple, without sensitive data)
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// =============================================================================
// Routes
// =============================================================================

// Public routes (no auth required)
app.use('/health', healthRouter);
app.use('/auth', authRouter);

// Protected API routes (require rate limit + API key + JWT)
app.use('/api', 
  apiRateLimiter,
  requireApiKey,
  requireAuth,
  emailLogsRouter
);

// Root route (public info)
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Holiday Email Orchestrator API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      login: 'POST /auth/login',
      logBatch: 'POST /api/log-email-batch (protected)',
      getLogs: 'GET /api/email-logs (protected)',
      getBatch: 'GET /api/email-logs/:id (protected)',
    },
  });
});

// =============================================================================
// Error Handling
// =============================================================================

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ ok: false, error: 'Not found' });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Unhandled error:', err);
  
  res.status(500).json({
    ok: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
});

// =============================================================================
// Server Startup
// =============================================================================

app.listen(PORT, () => {
  console.log('🚀 Holiday Email Backend API');
  console.log(`   Port: ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log('');
});

export default app;
