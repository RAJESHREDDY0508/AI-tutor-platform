import type { Request, Response, NextFunction } from 'express';

import { AuthService } from '../services/auth.service';
import type { LoginDto, RegisterDto, RefreshTokenDto } from '../services/auth.schema';

/**
 * Thin controller – delegates all business logic to AuthService.
 * Controllers only handle HTTP concern: req/res shape, status codes.
 */
export class AuthController {
  private readonly authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as RegisterDto;
      const result = await this.authService.register(dto);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as LoginDto;
      const tokens = await this.authService.login(dto);
      res.status(200).json({ success: true, data: tokens });
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as RefreshTokenDto;
      const tokens = await this.authService.refreshTokens(dto.refreshToken);
      res.status(200).json({ success: true, data: tokens });
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader?.split(' ')[1];
      if (token) {
        await this.authService.logout(token);
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
