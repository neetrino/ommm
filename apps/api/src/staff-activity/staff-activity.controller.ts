import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Role, type User } from '@prisma/client';
import { BACKOFFICE_READ_ROLES } from '../common/backoffice-roles';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ListStaffActivityQueryDto } from './dto/list-staff-activity-query.dto';
import { StaffActivityService } from './staff-activity.service';

@Controller('staff-activity')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...BACKOFFICE_READ_ROLES, Role.COACH)
export class StaffActivityController {
  constructor(private readonly staffActivity: StaffActivityService) {}

  @Get()
  @SkipThrottle()
  list(@CurrentUser() user: User, @Query() query: ListStaffActivityQueryDto) {
    return this.staffActivity.list(user, query);
  }

  @Get('header')
  @SkipThrottle()
  listHeader(@CurrentUser() user: User) {
    return this.staffActivity.listHeader(user);
  }

  @Get('unread-count')
  @SkipThrottle()
  unreadCount(@CurrentUser() user: User) {
    return this.staffActivity.unreadCount(user);
  }

  @Post('mark-read')
  markAllRead(@CurrentUser() user: User) {
    return this.staffActivity.markAllRead(user);
  }
}
