/**
 * Zod validation schemas for email log endpoints.
 * 
 * These schemas validate incoming request bodies and provide
 * type-safe data for use in route handlers.
 */

import { z } from 'zod';

/**
 * Schema for the POST /api/log-email-batch request body.
 */
export const LogEmailBatchSchema = z.object({
  holidayName: z.string().min(1, 'Holiday name is required'),
  tone: z.string().nullable().optional(),
  audienceType: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  senderName: z.string().min(1, 'Sender name is required'),
  recipients: z.array(z.string().email('Invalid email address')).min(1, 'At least one recipient is required'),
  status: z.enum(['queued', 'sent', 'error']).default('sent'),
  errorMessage: z.string().nullable().optional(),
});

/**
 * TypeScript type derived from the schema.
 */
export type LogEmailBatchInput = z.infer<typeof LogEmailBatchSchema>;

/**
 * Schema for GET /api/email-logs query parameters.
 */
export const GetEmailLogsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  status: z.enum(['queued', 'sent', 'error']).optional(),
});

export type GetEmailLogsQuery = z.infer<typeof GetEmailLogsQuerySchema>;
