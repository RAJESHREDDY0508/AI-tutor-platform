import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Redis } from 'ioredis';
import { Inject } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import type { User } from '../users/users.entity';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import type { JwtPayload } from '@ai-tutor/common';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly REFRESH_TOKEN_PREFIX = 'refresh_token:';
  private readonly BLACKLIST_PREFIX = 'token_blacklist:';

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: ReturnType<User['toSafeObject']> }> {
    const user = await this.usersService.create(dto);
    this.logger.log({ userId: user.id }, 'New user registered');
    return { user: user.toSafeObject() };
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !(await user.validatePassword(dto.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const tokens = await this.generateTokenPair(user);
    await this.usersService.updateLastLogin(user.id);

    this.logger.log({ userId: user.id }, 'User logged in');
    return tokens;
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Verify the refresh token still exists in Redis (not rotated or logged out)
    const stored = await this.redis.get(`${this.REFRESH_TOKEN_PREFIX}${payload.sub}`);
    if (stored !== refreshToken) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Rotate: delete old refresh token, issue new pair
    await this.redis.del(`${this.REFRESH_TOKEN_PREFIX}${payload.sub}`);
    return this.generateTokenPair(user);
  }

  async logout(accessToken: string): Promise<void> {
    try {
      const payload = this.jwtService.decode<JwtPayload>(accessToken);
      if (payload?.sub) {
        // Delete stored refresh token
        await this.redis.del(`${this.REFRESH_TOKEN_PREFIX}${payload.sub}`);

        // Blacklist the access token until it expires
        const ttl = (payload.exp ?? 0) - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await this.redis.setex(`${this.BLACKLIST_PREFIX}${accessToken}`, ttl, '1');
        }
      }
    } catch {
      // Silently fail on malformed token — logout should always succeed
    }
  }

  private async generateTokenPair(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: accessExpiresIn }),
      this.jwtService.signAsync(payload, { expiresIn: refreshExpiresIn }),
    ]);

    // Store refresh token in Redis
    const refreshTtlSeconds = this.parseDurationToSeconds(refreshExpiresIn);
    await this.redis.setex(
      `${this.REFRESH_TOKEN_PREFIX}${user.id}`,
      refreshTtlSeconds,
      refreshToken,
    );

    return { accessToken, refreshToken, expiresIn: this.parseDurationToSeconds(accessExpiresIn) };
  }

  private parseDurationToSeconds(duration: string): number {
    const match = /^(\d+)([smhd])$/.exec(duration);
    if (!match) return 900;
    const [, value, unit] = match;
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return parseInt(value ?? '15', 10) * (multipliers[unit ?? 'm'] ?? 60);
  }
}
