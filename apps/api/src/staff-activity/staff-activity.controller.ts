import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { BACKOFFICE_READ_ROLES } from '../common/backoffice-roles';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ListStaffActivityQueryDto } from './dto/list-staff-activity-query.dto';
import { StaffActivityService } from './staff-activity.service';

@Controller('staff-activity')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...BACKOFFICE_READ_ROLES)
export class StaffActivityController {
  constructor(private readonly staffActivity: StaffActivityService) {}

  @Get()
  @SkipThrottle()
  list(@Query() query: ListStaffActivityQueryDto) {
    return this.staffActivity.list(query);
  }

  @Get('header')
  @SkipThrottle()
  listHeader() {
    return this.staffActivity.listHeader();
  }

  @Get('unread-count')
  @SkipThrottle()
  unreadCount() {
    return this.staffActivity.unreadCount();
  }

  @Post('mark-read')
  markAllRead() {
    return this.staffActivity.markAllRead();
  }
}
