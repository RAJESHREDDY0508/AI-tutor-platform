import express from 'express';
import helmet from 'helmet';

export function createApp(): express.Application {
  const app = express();
  app.use(helmet());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'llm-wrapper',
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}
