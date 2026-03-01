import { authClient } from './httpClient';
import type { AuthTokens, User } from '@/types';

interface AuthResponse {
  success: boolean;
  data: { user: User };
  message?: string;
}

interface LoginResponse {
  success: boolean;
  data: AuthTokens;
}

interface MessageResponse {
  success: boolean;
  message: string;
}

export const authService = {
  async signup(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> {
    const res = await authClient.post<AuthResponse>('/v1/auth/signup', data);
    return res.data;
  },

  async login(data: { email: string; password: string }): Promise<LoginResponse> {
    const res = await authClient.post<LoginResponse>('/v1/auth/login', data);
    return res.data;
  },

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const res = await authClient.post<LoginResponse>('/v1/auth/refresh-token', {
      refreshToken,
    });
    return res.data;
  },

  async logout(): Promise<void> {
    await authClient.post('/v1/auth/logout');
  },

  async verifyEmail(token: string): Promise<MessageResponse> {
    const res = await authClient.get<MessageResponse>('/v1/auth/verify-email', {
      params: { token },
    });
    return res.data;
  },

  async resendVerification(email: string): Promise<MessageResponse> {
    const res = await authClient.post<MessageResponse>('/v1/auth/resend-verification', {
      email,
    });
    return res.data;
  },
};
