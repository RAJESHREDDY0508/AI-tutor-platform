import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '../../users/users.entity';

export const ROLES_KEY = 'roles';

/** Marks a route as accessible only by users with the specified roles. */
export const Roles = (...roles: UserRole[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
