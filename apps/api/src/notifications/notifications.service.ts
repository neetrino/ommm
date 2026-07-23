import { Injectable } from '@nestjs/common';
import { BroadcastAudience } from './dto/broadcast.dto';
import type { AdminListDeliveriesQueryDto } from './dto/admin-list-deliveries-query.dto';
import type { AdminListScheduledQueryDto } from './dto/admin-list-scheduled-query.dto';
import { NotificationsAnalyticsService } from './notifications-analytics.service';
import { NotificationsBroadcastService } from './notifications-broadcast.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly broadcast: NotificationsBroadcastService,
    private readonly analytics: NotificationsAnalyticsService,
  ) {}

  broadcastToAll(
    subject: string,
    html: string,
    options: {
      testTo?: string;
      audience: BroadcastAudience;
      onlyPromotionsOptIn: boolean;
      scheduleEntityId?: string;
    },
  ) {
    return this.broadcast.broadcastToAll(subject, html, options);
  }

  scheduleBroadcast(
    actorId: string,
    params: {
      subject: string;
      html: string;
      audience: BroadcastAudience;
      onlyPromotionsOptIn: boolean;
      scheduleAt: string;
    },
  ) {
    return this.broadcast.scheduleBroadcast(actorId, params);
  }

  listScheduledBroadcasts(query: AdminListScheduledQueryDto = {}) {
    return this.broadcast.listScheduledBroadcasts(query);
  }

  updateScheduledBroadcast(
    actorId: string,
    id: string,
    changes: {
      subject?: string;
      html?: string;
      audience?: BroadcastAudience;
      onlyPromotionsOptIn?: boolean;
      scheduleAt?: string;
    },
  ) {
    return this.broadcast.updateScheduledBroadcast(actorId, id, changes);
  }

  cancelScheduledBroadcast(actorId: string, id: string) {
    return this.broadcast.cancelScheduledBroadcast(actorId, id);
  }

  getAdminStats() {
    return this.analytics.getAdminStats();
  }

  getRecentDeliveries(query: AdminListDeliveriesQueryDto = {}) {
    return this.analytics.getRecentDeliveries(query);
  }

  getCampaignAnalytics(days: number) {
    return this.analytics.getCampaignAnalytics(days);
  }
}
