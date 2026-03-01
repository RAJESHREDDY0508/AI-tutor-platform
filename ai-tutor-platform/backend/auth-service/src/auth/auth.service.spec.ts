import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { SqsClient } from '../queue/sqs.client';
import { UserRole } from '../users/users.entity';

function createMockUser(overrides = {}) {
  return {
    id: 'user-uuid-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.STUDENT,
    isEmailVerified: true,
    isActive: true,
    passwordHash: 'hashed',
    emailVerificationToken: null,
    emailVerificationExpiresAt: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    fullName: 'Test User',
    validatePassword: jest.fn().mockResolvedValue(true),
    normaliseEmail: jest.fn(),
    toSafeObject: jest.fn().mockReturnValue({
      id: 'user-uuid-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.STUDENT,
    }),
    ...overrides,
  };
}

describe('AuthService', () => {
  let service: AuthService;

  const mockRedis = {
    get: jest.fn(),
    setex: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
  };

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    setVerificationToken: jest.fn().mockResolvedValue('verify-token'),
    findByVerificationToken: jest.fn(),
    markEmailVerified: jest.fn(),
    updateLastLogin: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock.jwt.token'),
    verifyAsync: jest.fn(),
    decode: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const map: Record<string, string> = {
        JWT_ACCESS_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7d',
        FRONTEND_URL: 'http://localhost:3000',
      };
      return map[key] ?? defaultValue;
    }),
    getOrThrow: jest.fn().mockReturnValue('test-secret'),
  };

  const mockSqsClient = {
    sendEmailNotification: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: 'REDIS_CLIENT', useValue: mockRedis },
        { provide: SqsClient, useValue: mockSqsClient },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
    // Re-apply defaults after clearAllMocks
    mockRedis.setex.mockResolvedValue('OK');
    mockRedis.del.mockResolvedValue(1);
    mockJwtService.signAsync.mockResolvedValue('mock.jwt.token');
    mockSqsClient.sendEmailNotification.mockResolvedValue(undefined);
    mockUsersService.setVerificationToken.mockResolvedValue('verify-token');
    mockConfigService.get.mockImplementation((key: string, defaultValue?: string) => {
      const map: Record<string, string> = {
        JWT_ACCESS_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7d',
        FRONTEND_URL: 'http://localhost:3000',
      };
      return map[key] ?? defaultValue;
    });
    mockConfigService.getOrThrow.mockReturnValue('test-secret');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── register ────────────────────────────────────────────────────────

  describe('register', () => {
    it('creates a user and sends verification email', async () => {
      const user = createMockUser();
      mockUsersService.create.mockResolvedValue(user);

      const result = await service.register({
        email: 'test@example.com',
        password: 'SecurePass1!',
        firstName: 'Test',
        lastName: 'User',
      } as any);

      expect(result.user).toBeDefined();
      expect(mockUsersService.create).toHaveBeenCalled();
      expect(mockUsersService.setVerificationToken).toHaveBeenCalledWith('user-uuid-1');
      expect(mockSqsClient.sendEmailNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          templateId: 'email-verification',
        }),
      );
    });
  });

  // ── login ───────────────────────────────────────────────────────────

  describe('login', () => {
    it('returns tokens for valid credentials with verified email', async () => {
      const user = createMockUser();
      mockUsersService.findByEmail.mockResolvedValue(user);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.login({ email: 'test@example.com', password: 'Password1!' });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(mockUsersService.updateLastLogin).toHaveBeenCalledWith('user-uuid-1');
    });

    it('throws for invalid password', async () => {
      const user = createMockUser({ validatePassword: jest.fn().mockResolvedValue(false) });
      mockUsersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws for nonexistent user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws for deactivated account', async () => {
      const user = createMockUser({ isActive: false });
      mockUsersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.login({ email: 'test@example.com', password: 'Password1!' }),
      ).rejects.toThrow('Account is deactivated');
    });

    it('throws for unverified email', async () => {
      const user = createMockUser({ isEmailVerified: false });
      mockUsersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.login({ email: 'test@example.com', password: 'Password1!' }),
      ).rejects.toThrow('Please verify your email before logging in');
    });
  });

  // ── verifyEmail ─────────────────────────────────────────────────────

  describe('verifyEmail', () => {
    it('verifies email with valid token', async () => {
      const user = createMockUser({
        emailVerificationExpiresAt: new Date(Date.now() + 3600_000),
      });
      mockUsersService.findByVerificationToken.mockResolvedValue(user);

      const result = await service.verifyEmail('valid-token');

      expect(result.message).toBe('Email verified successfully');
      expect(mockUsersService.markEmailVerified).toHaveBeenCalledWith('user-uuid-1');
    });

    it('throws for empty token', async () => {
      await expect(service.verifyEmail('')).rejects.toThrow(BadRequestException);
    });

    it('throws for invalid token', async () => {
      mockUsersService.findByVerificationToken.mockResolvedValue(null);

      await expect(service.verifyEmail('bad-token')).rejects.toThrow(
        'Invalid or expired verification token',
      );
    });

    it('throws for expired token', async () => {
      const user = createMockUser({
        emailVerificationExpiresAt: new Date(Date.now() - 3600_000),
      });
      mockUsersService.findByVerificationToken.mockResolvedValue(user);

      await expect(service.verifyEmail('expired-token')).rejects.toThrow(
        'Verification token has expired',
      );
    });
  });

  // ── resendVerification ──────────────────────────────────────────────

  describe('resendVerification', () => {
    it('sends verification email for unverified user', async () => {
      const user = createMockUser({ isEmailVerified: false });
      mockUsersService.findByEmail.mockResolvedValue(user);

      const result = await service.resendVerification('test@example.com');

      expect(result.message).toContain('If that email exists');
      expect(mockUsersService.setVerificationToken).toHaveBeenCalled();
      expect(mockSqsClient.sendEmailNotification).toHaveBeenCalled();
    });

    it('returns generic message for nonexistent email (prevents enumeration)', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.resendVerification('nobody@example.com');

      expect(result.message).toContain('If that email exists');
      expect(mockUsersService.setVerificationToken).not.toHaveBeenCalled();
    });

    it('returns generic message for already verified email', async () => {
      const user = createMockUser({ isEmailVerified: true });
      mockUsersService.findByEmail.mockResolvedValue(user);

      const result = await service.resendVerification('test@example.com');

      expect(result.message).toContain('If that email exists');
      expect(mockUsersService.setVerificationToken).not.toHaveBeenCalled();
    });
  });

  // ── logout ──────────────────────────────────────────────────────────

  describe('logout', () => {
    it('blacklists access token and deletes refresh token', async () => {
      mockJwtService.decode.mockReturnValue({
        sub: 'user-uuid-1',
        exp: Math.floor(Date.now() / 1000) + 900,
      });

      await service.logout('access-token');

      expect(mockRedis.del).toHaveBeenCalledWith('refresh_token:user-uuid-1');
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'token_blacklist:access-token',
        expect.any(Number),
        '1',
      );
    });

    it('does not throw on malformed token', async () => {
      mockJwtService.decode.mockReturnValue(null);
      await expect(service.logout('bad-token')).resolves.toBeUndefined();
    });
  });

  // ── refresh ─────────────────────────────────────────────────────────

  describe('refresh', () => {
    it('rotates tokens on valid refresh', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 'user-uuid-1',
        email: 'test@example.com',
        role: 'student',
      });
      mockRedis.get.mockResolvedValue('old-refresh-token');
      mockUsersService.findById.mockResolvedValue(createMockUser());
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access')
        .mockResolvedValueOnce('new-refresh');

      const result = await service.refresh('old-refresh-token');

      expect(result.accessToken).toBe('new-access');
      expect(result.refreshToken).toBe('new-refresh');
      expect(mockRedis.del).toHaveBeenCalledWith('refresh_token:user-uuid-1');
    });

    it('throws for revoked refresh token', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ sub: 'user-uuid-1' });
      mockRedis.get.mockResolvedValue('different-token');

      await expect(service.refresh('old-refresh-token')).rejects.toThrow(
        'Refresh token has been revoked',
      );
    });

    it('throws for invalid/expired refresh token', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(service.refresh('expired-token')).rejects.toThrow(
        'Invalid or expired refresh token',
      );
    });
  });
});
