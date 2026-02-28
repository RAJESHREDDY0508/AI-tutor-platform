import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';
import type { UserRole } from '../../users/users.entity';
import type { User } from '../../users/users.entity';

/**
 * Role-based access control guard.
 * Must be used AFTER JwtAuthGuard (requires req.user to be populated).
 *
 * Usage:
 *   @Roles(UserRole.ADMIN)
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Get('admin-only')
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No role requirement — allow access
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<{ user?: User }>();
    const user = request.user;

    if (!user) throw new ForbiddenException('No authenticated user found');

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Access restricted to roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
