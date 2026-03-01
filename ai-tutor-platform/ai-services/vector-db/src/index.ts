import { createApp } from './app';
import { env } from './config/env';

const app = createApp();
const server = app.listen(env.PORT, () => {
  console.log(`Vector DB service started on port ${env.PORT}`);
});

const shutdown = (signal: string): void => {
  console.log(`${signal} received, shutting down`);
  server.close(() => { process.exit(0); });
  setTimeout(() => process.exit(1), 10_000);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
