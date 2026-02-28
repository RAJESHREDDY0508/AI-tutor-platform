import { registerAs } from '@nestjs/config';
import type { RedisOptions } from 'ioredis';

export const redisConfig = registerAs(
  'redis',
  (): RedisOptions => ({
    host: process.env['REDIS_HOST'] ?? 'localhost',
    port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
    password: process.env['REDIS_PASSWORD'] || undefined,
    lazyConnect: true,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number): number | null => {
      if (times > 5) return null;   // Stop retrying after 5 attempts
      return Math.min(times * 200, 2000);
    },
    reconnectOnError: (err: Error): boolean => {
      return err.message.includes('READONLY');
    },
  }),
);
