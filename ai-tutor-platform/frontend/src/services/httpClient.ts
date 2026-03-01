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

  // ── Response interceptor: 401 → refresh token, then normalise errors ──
  let isRefreshing = false;
  let refreshSubscribers: Array<(token: string) => void> = [];

  function onTokenRefreshed(token: string) {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
  }

  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error)) return Promise.reject(error);

      const originalRequest = error.config;
      const status = error.response?.status;

      // Attempt silent refresh on 401 (skip if this IS the refresh or login call)
      if (
        status === 401 &&
        originalRequest &&
        !originalRequest.url?.includes('/v1/auth/refresh-token') &&
        !originalRequest.url?.includes('/v1/auth/login')
      ) {
        const refreshToken = localStorage.getItem('refresh_token');

        if (refreshToken) {
          if (!isRefreshing) {
            isRefreshing = true;
            try {
              const res = await axios.post<{ data: { accessToken: string; refreshToken: string } }>(
                '/api/auth/v1/auth/refresh-token',
                { refreshToken },
              );
              const { accessToken: newAccess, refreshToken: newRefresh } = res.data.data;
              localStorage.setItem('access_token', newAccess);
              localStorage.setItem('refresh_token', newRefresh);
              isRefreshing = false;
              onTokenRefreshed(newAccess);

              // Retry original request with new token
              originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
              return client(originalRequest);
            } catch {
              isRefreshing = false;
              refreshSubscribers = [];
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
              window.location.href = '/login';
              return Promise.reject(error);
            }
          }

          // Queue requests while refresh is in progress
          return new Promise((resolve) => {
            refreshSubscribers.push((token: string) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(client(originalRequest));
            });
          });
        }

        // No refresh token — clear and redirect
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      const message: string =
        (error.response?.data as Record<string, string> | undefined)?.['message'] ??
        error.message ??
        'An unexpected error occurred';

      return Promise.reject(new Error(message));
    },
  );

  return client;
}

export const authClient = createHttpClient('/api/auth');
export const sessionClient = createHttpClient('/api/session');
export const curriculumClient = createHttpClient('/api/curriculum');
