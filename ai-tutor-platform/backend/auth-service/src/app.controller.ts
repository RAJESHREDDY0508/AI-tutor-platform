import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { Public } from './common/decorators/public.decorator';

@ApiTags('system')
@Controller()
export class AppController {
  /**
   * GET /health
   * Used by Docker health checks, Kubernetes liveness probes, and load balancers.
   */
  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check' })
  health(): object {
    return {
      status: 'ok',
      service: 'auth-service',
      version: process.env['npm_package_version'] ?? '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * GET /status
   * Extended service status — includes environment info (non-sensitive).
   */
  @Public()
  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Service status' })
  status(): object {
    return {
      service: 'auth-service',
      environment: process.env['NODE_ENV'] ?? 'development',
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    };
  }
}
