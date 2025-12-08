/**
 * Email logs routes.
 * 
 * Handles logging email batches and retrieving email logs.
 */

import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../db/client';
import { 
  LogEmailBatchSchema, 
  GetEmailLogsQuerySchema,
  type LogEmailBatchInput,
  type GetEmailLogsQuery 
} from '../validation/emailLog';
import { ZodError } from 'zod';

const router = Router();

/**
 * Error handler for Zod validation errors.
 */
function handleValidationError(error: ZodError, res: Response): void {
  const errors = error.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }));
  res.status(400).json({ 
    ok: false, 
    error: 'Validation failed', 
    details: errors 
  });
}

/**
 * POST /api/log-email-batch
 * 
 * Logs a batch of emails sent via the n8n webhook.
 * Creates an EmailBatch record and associated EmailRecipient records.
 */
router.post('/log-email-batch', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const parsed = LogEmailBatchSchema.safeParse(req.body);
    
    if (!parsed.success) {
      handleValidationError(parsed.error, res);
      return;
    }

    const data: LogEmailBatchInput = parsed.data;

    // Create the email batch with recipients in a transaction
    const batch = await prisma.emailBatch.create({
      data: {
        holidayName: data.holidayName,
        tone: data.tone ?? null,
        audienceType: data.audienceType ?? null,
        language: data.language ?? null,
        senderName: data.senderName,
        status: data.status,
        errorMessage: data.errorMessage ?? null,
        recipients: {
          create: data.recipients.map((email) => ({
            email,
          })),
        },
      },
      include: {
        recipients: true,
      },
    });

    console.log(`[EmailLogs] Created batch ${batch.id} with ${batch.recipients.length} recipients`);

    res.status(201).json({
      ok: true,
      batchId: batch.id,
      recipientCount: batch.recipients.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/email-logs
 * 
 * Retrieves recent email batch logs.
 * Supports optional query parameters for pagination and filtering.
 */
router.get('/email-logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate query parameters
    const parsed = GetEmailLogsQuerySchema.safeParse(req.query);
    
    if (!parsed.success) {
      handleValidationError(parsed.error, res);
      return;
    }

    const query: GetEmailLogsQuery = parsed.data;

    // Build where clause
    const where = query.status ? { status: query.status } : {};

    // Fetch batches with recipient count
    const [batches, total] = await Promise.all([
      prisma.emailBatch.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: query.offset,
        include: {
          _count: {
            select: { recipients: true },
          },
        },
      }),
      prisma.emailBatch.count({ where }),
    ]);

    // Transform response
    const logs = batches.map((batch) => ({
      id: batch.id,
      createdAt: batch.createdAt.toISOString(),
      holidayName: batch.holidayName,
      tone: batch.tone,
      audienceType: batch.audienceType,
      language: batch.language,
      senderName: batch.senderName,
      status: batch.status,
      errorMessage: batch.errorMessage,
      recipientCount: batch._count.recipients,
    }));

    res.json({
      ok: true,
      logs,
      total,
      limit: query.limit,
      offset: query.offset,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/email-logs/:id
 * 
 * Retrieves a specific email batch with all recipients.
 */
router.get('/email-logs/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const batch = await prisma.emailBatch.findUnique({
      where: { id },
      include: {
        recipients: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!batch) {
      res.status(404).json({ ok: false, error: 'Batch not found' });
      return;
    }

    res.json({
      ok: true,
      batch: {
        id: batch.id,
        createdAt: batch.createdAt.toISOString(),
        holidayName: batch.holidayName,
        tone: batch.tone,
        audienceType: batch.audienceType,
        language: batch.language,
        senderName: batch.senderName,
        status: batch.status,
        errorMessage: batch.errorMessage,
        recipients: batch.recipients.map((r) => ({
          id: r.id,
          email: r.email,
          subject: r.subject,
          createdAt: r.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
