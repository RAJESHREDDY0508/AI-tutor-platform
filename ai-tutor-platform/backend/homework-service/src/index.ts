import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = createApp();
const server = app.listen(env.PORT, () => {
  logger.info({ service: 'homework-service', port: env.PORT }, 'Homework service started');
});

const shutdown = (signal: string): void => {
  logger.info({ signal }, 'Shutdown signal received');
  server.close(() => { process.exit(0); });
  setTimeout(() => process.exit(1), 10_000);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
