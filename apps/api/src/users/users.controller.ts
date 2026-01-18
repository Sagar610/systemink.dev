import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { UpdateProfileDto, UpdateRoleDto } from './dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Public: Get authors list
  @Get('authors')
  getAuthors(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @CurrentUser('id') currentUserId?: string,
  ) {
    return this.usersService.getAuthors(page || 1, limit || 20, currentUserId);
  }

  // Public: Get user by username
  @Get(':username')
  findByUsername(
    @Param('username') username: string,
    @CurrentUser('id') currentUserId?: string,
  ) {
    return this.usersService.findByUsername(username, currentUserId);
  }

  // Follow/Unfollow user
  @Post(':username/follow')
  @UseGuards(JwtAuthGuard)
  toggleFollow(
    @Param('username') username: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.toggleFollowByUsername(userId, username);
  }

  // Private: Update own profile
  @Put('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  // Admin: List all users
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.usersService.findAll(page || 1, limit || 20);
  }

  // Admin: Update user role
  @Put(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateRole(
    @Param('id') userId: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.usersService.updateRole(userId, adminId, dto);
  }

  // Admin: Delete user
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deleteUser(@Param('id') userId: string, @CurrentUser('id') adminId: string) {
    return this.usersService.deleteUser(userId, adminId);
  }
}
