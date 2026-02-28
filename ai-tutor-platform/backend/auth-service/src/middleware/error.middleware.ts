import type { Request, Response, NextFunction } from 'express';

import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/**
 * Central error handler.
 * Must be registered LAST in the Express middleware chain.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
    return;
  }

  // Unexpected error
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(env.NODE_ENV !== 'production' && { stack: err instanceof Error ? err.stack : String(err) }),
  });
}
