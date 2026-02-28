import { Router } from 'express';
import type { Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ok',
    service: 'auth-service',
    version: process.env['npm_package_version'] ?? '1.0.0',
    timestamp: new Date().toISOString(),
  });
});
