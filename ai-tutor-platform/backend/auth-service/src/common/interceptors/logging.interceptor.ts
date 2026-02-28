import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request } from 'express';

/**
 * Logs every HTTP request with method, path, status, and duration.
 * Registered globally in main.ts.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = req;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse<{ statusCode: number }>();
          const duration = Date.now() - startTime;
          this.logger.log(`${method} ${url} ${res.statusCode} ${duration}ms — ${ip}`);
        },
        error: (err: unknown) => {
          const duration = Date.now() - startTime;
          const status = err instanceof Error ? 'ERR' : 500;
          this.logger.warn(`${method} ${url} ${status} ${duration}ms — ${ip}`);
        },
      }),
    );
  }
}
