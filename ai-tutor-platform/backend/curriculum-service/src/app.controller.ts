import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('system')
@Controller()
export class AppController {
  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check' })
  health(): object {
    return {
      status: 'ok',
      service: 'curriculum-service',
      version: process.env['npm_package_version'] ?? '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Service status' })
  status(): object {
    return {
      service: 'curriculum-service',
      environment: process.env['NODE_ENV'] ?? 'development',
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    };
  }
}
