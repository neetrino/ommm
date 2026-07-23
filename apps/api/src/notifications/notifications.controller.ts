import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  BACKOFFICE_DELETE_ROLES,
  BACKOFFICE_WRITE_ROLES,
} from '../common/backoffice-roles';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminListDeliveriesQueryDto } from './dto/admin-list-deliveries-query.dto';
import { AdminListScheduledQueryDto } from './dto/admin-list-scheduled-query.dto';
import { BroadcastAudience, BroadcastDto } from './dto/broadcast.dto';
import { NotificationsService } from './notifications.service';
import { UpdateScheduledBroadcastDto } from './dto/update-scheduled-broadcast.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Post('admin/broadcast')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  broadcast(@CurrentUser() user: { id: string }, @Body() dto: BroadcastDto) {
    if (dto.scheduleAt) {
      return this.notifications.scheduleBroadcast(user.id, {
        subject: dto.subject,
        html: dto.html,
        audience: dto.audience ?? BroadcastAudience.USERS,
        onlyPromotionsOptIn: dto.onlyPromotionsOptIn ?? false,
        scheduleAt: dto.scheduleAt,
      });
    }
    return this.notifications.broadcastToAll(dto.subject, dto.html, {
      testTo: dto.testTo,
      audience: dto.audience ?? BroadcastAudience.USERS,
      onlyPromotionsOptIn: dto.onlyPromotionsOptIn ?? false,
    });
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  adminStats() {
    return this.notifications.getAdminStats();
  }

  @Get('admin/deliveries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  adminDeliveries(@Query() query: AdminListDeliveriesQueryDto) {
    return this.notifications.getRecentDeliveries(query);
  }

  /** Analytics boundary — Admin only (no Manager). */
  @Get('admin/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_DELETE_ROLES)
  adminAnalytics(@Query('days') days?: string) {
    const parsed = days ? Number.parseInt(days, 10) : 30;
    const safeDays = Number.isFinite(parsed) ? parsed : 30;
    return this.notifications.getCampaignAnalytics(safeDays);
  }

  @Get('admin/scheduled')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  adminScheduled(@Query() query: AdminListScheduledQueryDto) {
    return this.notifications.listScheduledBroadcasts(query);
  }

  @Patch('admin/scheduled/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  updateScheduled(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateScheduledBroadcastDto,
  ) {
    return this.notifications.updateScheduledBroadcast(user.id, id, dto);
  }

  /** Soft cancel (not permanent delete) — Admin + Manager. */
  @Post('admin/scheduled/:id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  cancelScheduledPost(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.notifications.cancelScheduledBroadcast(user.id, id);
  }

  /** Soft cancel kept for backward compat — same policy as POST .../cancel. */
  @Delete('admin/scheduled/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  cancelScheduled(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.notifications.cancelScheduledBroadcast(user.id, id);
  }
}
