import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import pinoHttp from 'pino-http';

import { env } from './config/env';
import { healthRouter } from './routes/health.routes';
import { authRouter } from './routes/auth.routes';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';

export function createApp(): express.Application {
  const app = express();

  // ── Security middleware ──────────────────────────────────────────────
  app.use(helmet());
  app.disable('x-powered-by');

  // ── Request logging ──────────────────────────────────────────────────
  app.use(
    pinoHttp({
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      redact: ['req.headers.authorization', 'req.body.password'],
    }),
  );

  // ── Body parsing ─────────────────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: false }));

  // ── Global rate limiting ──────────────────────────────────────────────
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX_REQUESTS,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many requests, please try again later.' },
    }),
  );

  // ── Routes ────────────────────────────────────────────────────────────
  app.use('/health', healthRouter);
  app.use('/v1/auth', authRouter);

  // ── Error handlers (must be last) ─────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
