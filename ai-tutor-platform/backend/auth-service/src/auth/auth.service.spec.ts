import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;

  const mockRedis = {
    setex: jest.fn().mockResolvedValue('OK'),
    get: jest.fn(),
    del: jest.fn().mockResolvedValue(1),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            updateLastLogin: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock.jwt.token'),
            verifyAsync: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('15m'),
            getOrThrow: jest.fn().mockReturnValue('test-secret'),
          },
        },
        { provide: 'REDIS_CLIENT', useValue: mockRedis },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('creates a user and returns safe user object', async () => {
      const mockUser = {
        id: 'uuid-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        toSafeObject: jest.fn().mockReturnValue({ id: 'uuid-123', email: 'test@example.com' }),
      };

      usersService.create.mockResolvedValue(mockUser as never);

      const result = await service.register({
        email: 'test@example.com',
        password: 'SecurePass1!',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(result.user).toEqual({ id: 'uuid-123', email: 'test@example.com' });
      expect(usersService.create).toHaveBeenCalledTimes(1);
    });

    it('propagates ConflictException from UsersService', async () => {
      usersService.create.mockRejectedValue(
        new ConflictException('An account with this email already exists'),
      );

      await expect(
        service.register({
          email: 'existing@example.com',
          password: 'SecurePass1!',
          firstName: 'Test',
          lastName: 'User',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
