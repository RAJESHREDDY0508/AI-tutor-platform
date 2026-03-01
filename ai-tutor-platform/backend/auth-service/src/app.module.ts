import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { QueueModule } from './queue/queue.module';
import { RedisModule } from './redis/redis.module';
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { redisConfig } from './config/redis.config';
import { validateEnv } from './config/env.validation';
import { User } from './users/users.entity';

@Module({
  imports: [
    // ── Config ──────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [databaseConfig, jwtConfig, redisConfig],
      envFilePath: ['.env', '.env.local'],
      cache: true,
    }),

    // ── Logging (Winston) ────────────────────────────────────────────────
    WinstonModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        transports: [
          new winston.transports.Console({
            level: config.get('NODE_ENV') === 'production' ? 'info' : 'debug',
            format:
              config.get('NODE_ENV') === 'production'
                ? winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json(),
                  )
                : winston.format.combine(
                    winston.format.colorize(),
                    winston.format.timestamp({ format: 'HH:mm:ss' }),
                    winston.format.printf(
                      ({ timestamp, level, message, context }) =>
                        `[${timestamp as string}] ${level} [${context as string}] ${message as string}`,
                    ),
                  ),
          }),
        ],
      }),
      inject: [ConfigService],
    }),

    // ── Database (TypeORM) ───────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('DB_HOST'),
        port: config.get<number>('DB_PORT', 5432),
        database: config.getOrThrow<string>('DB_NAME'),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        entities: [User],
        synchronize:
          config.get('DB_SYNCHRONIZE') === 'true' && config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') !== 'production',
        ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: true } : false,
        extra: { max: 20, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 5_000 },
      }),
      inject: [ConfigService],
    }),

    // ── Rate limiting (Throttler) ────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('THROTTLE_TTL_SECONDS', 60) * 1000,
            limit: config.get<number>('THROTTLE_LIMIT', 20),
          },
        ],
      }),
      inject: [ConfigService],
    }),

    // ── Infrastructure modules ──────────────────────────────────────────
    RedisModule,

    // ── Feature modules ──────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    QueueModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
