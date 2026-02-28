import { Controller, Get, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from './users.entity';
import { UserRole } from './users.entity';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /v1/users/me
   * Returns the currently authenticated user's profile.
   */
  @Get('me')
  @ApiOperation({ summary: "Get current user's profile" })
  getMe(@CurrentUser() user: User): object {
    return { success: true, data: user.toSafeObject() };
  }

  /**
   * GET /v1/users/:id
   * Admin-only – get any user by ID.
   */
  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  async getById(@Param('id', ParseUUIDPipe) id: string): Promise<object> {
    const user = await this.usersService.findById(id);
    return { success: true, data: user.toSafeObject() };
  }
}
