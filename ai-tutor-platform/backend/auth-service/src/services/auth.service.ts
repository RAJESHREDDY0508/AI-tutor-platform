/**
 * AuthService – business logic stub.
 *
 * Sprint 2 implementation will:
 *  - Connect to PostgreSQL via a repository layer
 *  - Hash passwords with bcrypt
 *  - Issue signed JWTs
 *  - Store refresh tokens in Redis
 *
 * The interface is defined here so controllers compile and routes are
 * testable end-to-end from Sprint 1 onwards.
 */

import type { RegisterDto, LoginDto } from './auth.schema';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterResult {
  id: string;
  email: string;
}

export class AuthService {
  async register(_dto: RegisterDto): Promise<RegisterResult> {
    // TODO Sprint 2: persist user, hash password, send verification email
    throw new Error('Not implemented – coming in Sprint 2');
  }

  async login(_dto: LoginDto): Promise<AuthTokens> {
    // TODO Sprint 2: validate credentials, issue JWT pair
    throw new Error('Not implemented – coming in Sprint 2');
  }

  async refreshTokens(_refreshToken: string): Promise<AuthTokens> {
    // TODO Sprint 2: verify refresh token, issue new access token
    throw new Error('Not implemented – coming in Sprint 2');
  }

  async logout(_accessToken: string): Promise<void> {
    // TODO Sprint 2: blacklist token in Redis
    throw new Error('Not implemented – coming in Sprint 2');
  }
}
