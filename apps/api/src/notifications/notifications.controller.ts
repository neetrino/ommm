import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BroadcastAudience, BroadcastDto } from './dto/broadcast.dto';
import { NotificationsService } from './notifications.service';
import { UpdateScheduledBroadcastDto } from './dto/update-scheduled-broadcast.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Post('admin/broadcast')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN)
  adminStats() {
    return this.notifications.getAdminStats();
  }

  @Get('admin/deliveries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  adminDeliveries() {
    return this.notifications.getRecentDeliveries();
  }

  @Get('admin/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  adminAnalytics(@Query('days') days?: string) {
    const parsed = days ? Number.parseInt(days, 10) : 30;
    const safeDays = Number.isFinite(parsed) ? parsed : 30;
    return this.notifications.getCampaignAnalytics(safeDays);
  }

  @Get('admin/scheduled')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  adminScheduled() {
    return this.notifications.listScheduledBroadcasts();
  }

  @Patch('admin/scheduled/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateScheduled(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateScheduledBroadcastDto,
  ) {
    return this.notifications.updateScheduledBroadcast(user.id, id, dto);
  }

  @Delete('admin/scheduled/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  cancelScheduled(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.notifications.cancelScheduledBroadcast(user.id, id);
  }
}
