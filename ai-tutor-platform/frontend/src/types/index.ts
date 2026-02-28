/**
 * Shared frontend types.
 * Mirrors the API contract defined in @ai-tutor/common.
 * Keep in sync with backend DTOs.
 */

// ─── API Response envelope ──────────────────────────────────────────────────

export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
  readonly message?: string;
  readonly timestamp: string;
}

export interface PaginatedResponse<T> {
  readonly items: ReadonlyArray<T>;
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasNextPage: boolean;
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface User {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: UserRole;
  readonly createdAt: string;
}

export type UserRole = 'student' | 'admin';

export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
}

// ─── Session ────────────────────────────────────────────────────────────────

export interface Session {
  readonly id: string;
  readonly userId: string;
  readonly topic: string;
  readonly status: SessionStatus;
  readonly startedAt: string;
  readonly endedAt?: string;
}

export type SessionStatus = 'active' | 'completed' | 'abandoned';

// ─── Common ─────────────────────────────────────────────────────────────────

export interface HealthCheck {
  readonly status: 'ok' | 'degraded' | 'down';
  readonly service: string;
  readonly version: string;
  readonly timestamp: string;
}
