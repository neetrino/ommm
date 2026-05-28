import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BroadcastAudience, BroadcastDto } from './dto/broadcast.dto';
import { NotificationsService } from './notifications.service';

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
}
