import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  // ── Logging ────────────────────────────────────────────────────────────
  app.useLogger(logger);

  // ── Global API prefix ──────────────────────────────────────────────────
  app.setGlobalPrefix('v1');

  // ── URI versioning ─────────────────────────────────────────────────────
  app.enableVersioning({ type: VersioningType.URI });

  // ── CORS ───────────────────────────────────────────────────────────────
  app.enableCors({
    origin: config.get<string>('NODE_ENV') === 'production'
      ? ['https://app.ai-tutor.io']
      : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // ── Global validation pipe ─────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip undeclared properties
      forbidNonWhitelisted: true, // Reject requests with undeclared properties
      transform: true,           // Auto-transform payloads to DTO instances
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Global exception filter ────────────────────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter());

  // ── Global interceptors ────────────────────────────────────────────────
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // ── Global JWT guard (routes opt-out with @Public()) ──────────────────
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // ── Swagger (disabled in production) ──────────────────────────────────
  if (config.get<string>('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Auth Service API')
      .setDescription('AI Tutor Platform – Authentication & User Management')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management endpoints')
      .addTag('system', 'Health & status endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });

    logger.log('Swagger UI available at /api', 'Bootstrap');
  }

  // ── Start server ───────────────────────────────────────────────────────
  const port = config.get<number>('PORT', 8001);
  await app.listen(port, '0.0.0.0');
  logger.log(`Auth service running on port ${port}`, 'Bootstrap');
}

bootstrap().catch((err: unknown) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
