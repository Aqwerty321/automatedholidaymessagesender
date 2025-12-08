/**
 * Prisma Client Singleton
 * 
 * This module exports a singleton instance of PrismaClient to be used
 * throughout the application. Using a singleton ensures we don't create
 * multiple connections to the database.
 */

import { PrismaClient } from '@prisma/client';

// Declare global type for prisma to avoid multiple instances in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Use existing client if available (prevents multiple instances during hot reload)
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

// In development, store the client globally to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
