import request from 'supertest';
import { createApp } from '../app';

describe('GET /health', () => {
  const app = createApp();
  it('returns 200 with ok status', async () => {
    const res = await request(app).get('/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok', service: 'homework-service' });
  });
});
