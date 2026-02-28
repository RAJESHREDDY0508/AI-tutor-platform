import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Headers,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /v1/auth/signup
   * Register a new student account.
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new student account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async signup(@Body() dto: RegisterDto): Promise<object> {
    const result = await this.authService.register(dto);
    return { success: true, data: result, message: 'Account created. Please verify your email.' };
  }

  /**
   * POST /v1/auth/login
   * Authenticate with email + password.
   * Returns an access token (15 min) and refresh token (7 days).
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate and receive JWT tokens' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<object> {
    const tokens = await this.authService.login(dto);
    return { success: true, data: tokens };
  }

  /**
   * POST /v1/auth/refresh-token
   * Exchange a valid refresh token for a new access token.
   * Implements refresh token rotation — the old refresh token is invalidated.
   */
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using a valid refresh token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<object> {
    const tokens = await this.authService.refresh(dto.refreshToken);
    return { success: true, data: tokens };
  }

  /**
   * POST /v1/auth/logout
   * Invalidates the current access token and clears the refresh token from Redis.
   */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate tokens' })
  async logout(@Headers('authorization') authHeader: string): Promise<void> {
    const token = authHeader?.replace('Bearer ', '');
    if (token) {
      await this.authService.logout(token);
    }
  }

  /**
   * GET /v1/auth/verify-email
   * Verify email address using the token sent to the user's inbox.
   */
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address using token from email' })
  async verifyEmail(@Query('token') _token: string, @Req() _req: Request): Promise<object> {
    // TODO Sprint 2: implement email verification token lookup + marking
    return { success: false, message: 'Not implemented – Sprint 2' };
  }
}
