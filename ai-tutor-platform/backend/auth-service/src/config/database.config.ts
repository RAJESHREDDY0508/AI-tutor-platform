import { registerAs } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { User } from '../users/users.entity';

/**
 * TypeORM configuration factory.
 * Registered as 'database' config namespace — injectable via ConfigService.
 */
export const databaseConfig = registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env['DB_HOST'] ?? 'localhost',
    port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
    database: process.env['DB_NAME'] ?? 'ai_tutor_auth',
    username: process.env['DB_USER'] ?? 'postgres',
    password: process.env['DB_PASSWORD'] ?? 'postgres',

    entities: [User],
    migrations: ['dist/database/migrations/*.js'],
    migrationsRun: false,

    // NEVER use synchronize:true in production — use migrations
    synchronize: process.env['DB_SYNCHRONIZE'] === 'true' && process.env['NODE_ENV'] !== 'production',
    logging: process.env['DB_LOGGING'] === 'true',

    ssl: process.env['NODE_ENV'] === 'production' ? { rejectUnauthorized: true } : false,

    // Connection pool
    extra: {
      max: 20,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    },
  }),
);
