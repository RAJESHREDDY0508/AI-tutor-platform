import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Central HTTP client.
 * All services extend this base to ensure consistent:
 *  - auth header injection
 *  - error normalisation
 *  - timeout enforcement
 */

const DEFAULT_TIMEOUT_MS = 15_000;

export function createHttpClient(baseURL: string, config?: AxiosRequestConfig): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: DEFAULT_TIMEOUT_MS,
    headers: { 'Content-Type': 'application/json' },
    ...config,
  });

  // ── Request interceptor: attach Bearer token ───────────────────────────
  client.interceptors.request.use(
    (req) => {
      const token = localStorage.getItem('access_token');
      if (token && req.headers) {
        req.headers['Authorization'] = `Bearer ${token}`;
      }
      return req;
    },
    (error: unknown) => Promise.reject(error),
  );

  // ── Response interceptor: normalise errors ────────────────────────────
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 401) {
          // Token expired – clear storage; redirect handled by router guard
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }

        const message: string =
          (error.response?.data as Record<string, string> | undefined)?.['message'] ??
          error.message ??
          'An unexpected error occurred';

        return Promise.reject(new Error(message));
      }
      return Promise.reject(error);
    },
  );

  return client;
}

export const authClient = createHttpClient('/api/auth');
export const sessionClient = createHttpClient('/api/session');
export const curriculumClient = createHttpClient('/api/curriculum');
