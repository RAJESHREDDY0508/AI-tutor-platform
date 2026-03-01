import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import type { Redis } from 'ioredis';

import { UsersService } from '../../users/users.service';
import type { JwtPayload } from '../../common/types/jwt-payload.type';

/**
 * JWT Passport strategy.
 * Validates access tokens on every protected request.
 * Checks the Redis blacklist so logged-out tokens are rejected.
 * Attaches the full User entity to req.user.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      issuer: configService.get<string>('JWT_ISSUER'),
      audience: configService.get<string>('JWT_AUDIENCE'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<object> {
    // Extract the raw token from the Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      // Check if the token has been blacklisted (logged out)
      const isBlacklisted = await this.redis.get(`token_blacklist:${token}`);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is inactive or not found');
    }

    return user;
  }
}
