import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(
    { service: 'auth-service', port: env.PORT, env: env.NODE_ENV },
    'Auth service started',
  );
});

// ── Graceful shutdown ──────────────────────────────────────────────────────

const shutdown = (signal: string): void => {
  logger.info({ signal }, 'Shutdown signal received');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force exit if connections don't close within 10 s
  setTimeout(() => {
    logger.error('Forcing process exit after timeout');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ reason }, 'Unhandled promise rejection');
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  logger.error({ error }, 'Uncaught exception');
  process.exit(1);
});
