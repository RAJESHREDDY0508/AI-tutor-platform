import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { healthRouter } from './routes/health.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound.middleware';

export function createApp(): express.Application {
  const app = express();
  app.use(helmet());
  app.disable('x-powered-by');
  app.use(pinoHttp({ level: env.NODE_ENV === 'production' ? 'info' : 'debug' }));
  app.use(express.json({ limit: '10kb' }));
  app.use('/health', healthRouter);
  app.use('/v1/analytics', analyticsRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
