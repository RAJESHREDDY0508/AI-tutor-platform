import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('returns success response with user data', async () => {
      const userData = { id: 'uuid-1', email: 'test@example.com' };
      mockAuthService.register.mockResolvedValue({ user: userData });

      const result = await controller.signup({
        email: 'test@example.com',
        password: 'Password1!',
        firstName: 'Test',
        lastName: 'User',
      } as any);

      expect(result).toEqual({
        success: true,
        data: { user: userData },
        message: 'Account created. Please verify your email.',
      });
    });
  });

  describe('login', () => {
    it('returns success response with tokens', async () => {
      const tokens = { accessToken: 'at', refreshToken: 'rt', expiresIn: 900 };
      mockAuthService.login.mockResolvedValue(tokens);

      const result = await controller.login({
        email: 'test@example.com',
        password: 'Password1!',
      });

      expect(result).toEqual({ success: true, data: tokens });
    });

    it('propagates UnauthorizedException', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid email or password'),
      );

      await expect(
        controller.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('returns new tokens', async () => {
      const tokens = { accessToken: 'new-at', refreshToken: 'new-rt', expiresIn: 900 };
      mockAuthService.refresh.mockResolvedValue(tokens);

      const result = await controller.refreshToken({ refreshToken: 'old-rt' });

      expect(result).toEqual({ success: true, data: tokens });
    });
  });

  describe('logout', () => {
    it('calls authService.logout with extracted token', async () => {
      await controller.logout('Bearer some-access-token');

      expect(mockAuthService.logout).toHaveBeenCalledWith('some-access-token');
    });
  });

  describe('verifyEmail', () => {
    it('returns success for valid token', async () => {
      mockAuthService.verifyEmail.mockResolvedValue({ message: 'Email verified successfully' });

      const result = await controller.verifyEmail('valid-token');

      expect(result).toEqual({ success: true, message: 'Email verified successfully' });
    });

    it('propagates BadRequestException for invalid token', async () => {
      mockAuthService.verifyEmail.mockRejectedValue(
        new BadRequestException('Invalid or expired verification token'),
      );

      await expect(controller.verifyEmail('bad-token')).rejects.toThrow(BadRequestException);
    });
  });

  describe('resendVerification', () => {
    it('returns generic success message', async () => {
      mockAuthService.resendVerification.mockResolvedValue({
        message: 'If that email exists and is unverified, a new verification link has been sent.',
      });

      const result = await controller.resendVerification({ email: 'test@example.com' } as any);

      expect(result).toEqual({
        success: true,
        message: 'If that email exists and is unverified, a new verification link has been sent.',
      });
    });
  });
});
