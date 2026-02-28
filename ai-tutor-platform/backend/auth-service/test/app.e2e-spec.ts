import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

import { AppController } from '../src/app.controller';

/**
 * E2E smoke test for Sprint 1.
 * Tests only the public /health and /status endpoints
 * without requiring a real database or Redis connection.
 */
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /v1/health', () => {
    it('returns 200 with ok status', async () => {
      const res = await request(app.getHttpServer()).get('/v1/health').expect(200);

      expect(res.body).toMatchObject({
        status: 'ok',
        service: 'auth-service',
      });
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /v1/status', () => {
    it('returns 200 with service status', async () => {
      const res = await request(app.getHttpServer()).get('/v1/status').expect(200);

      expect(res.body).toMatchObject({ service: 'auth-service' });
      expect(res.body).toHaveProperty('nodeVersion');
    });
  });
});
