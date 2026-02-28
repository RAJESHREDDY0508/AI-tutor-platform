import { registerAs } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig = registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret: process.env['JWT_SECRET'],
    signOptions: {
      expiresIn: process.env['JWT_ACCESS_EXPIRES_IN'] ?? '15m',
      issuer: process.env['JWT_ISSUER'] ?? 'ai-tutor-platform',
      audience: process.env['JWT_AUDIENCE'] ?? 'ai-tutor-clients',
    },
  }),
);
