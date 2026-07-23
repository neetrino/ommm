import { Injectable } from '@nestjs/common';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { AdminListDeliveriesQueryDto } from './dto/admin-list-deliveries-query.dto';
import {
  ACTION_BROADCAST,
  ACTION_BROADCAST_SCHEDULED,
  ACTION_BROADCAST_SCHEDULED_CANCELLED,
  ACTION_BROADCAST_SCHEDULED_FAILED,
  ACTION_BROADCAST_SCHEDULED_SENT,
  ACTION_NOTIFICATION_DELIVERY,
} from './notifications-audit.constants';
import {
  filterDeliveryRows,
  NOTIFICATIONS_FILTER_SCAN_LIMIT,
  paginateFilteredRows,
  requiresDeliveriesPostProcessing,
} from './notifications-list-filters';
import {
  composeDailyRows,
  parseBroadcastCampaignPayload,
  parseBroadcastPayload,
  parseDeliveryPayload,
} from './notifications-payload.helpers';

@Injectable()
export class NotificationsAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminStats() {
    const [
      scheduled,
      scheduledSent,
      scheduledFailed,
      immediateBroadcasts,
      remindersSent,
      scheduledCancelled,
      recentBroadcasts,
    ] = await Promise.all([
      this.prisma.auditLog.count({
        where: {
          action: ACTION_BROADCAST_SCHEDULED,
          entityType: 'Notification',
        },
      }),
      this.prisma.auditLog.count({
        where: {
          action: ACTION_BROADCAST_SCHEDULED_SENT,
          entityType: 'Notification',
        },
      }),
      this.prisma.auditLog.count({
        where: {
          action: ACTION_BROADCAST_SCHEDULED_FAILED,
          entityType: 'Notification',
        },
      }),
      this.prisma.auditLog.count({
        where: { action: ACTION_BROADCAST, entityType: 'Notification' },
      }),
      this.prisma.classReminderSendLog.count(),
      this.prisma.auditLog.count({
        where: {
          action: ACTION_BROADCAST_SCHEDULED_CANCELLED,
          entityType: 'Notification',
        },
      }),
      this.prisma.auditLog.findMany({
        where: { action: ACTION_BROADCAST, entityType: 'Notification' },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
    ]);
    const byAudience = { users: 0, coaches: 0, staff: 0, all: 0 };
    for (const item of recentBroadcasts) {
      const payload = parseBroadcastPayload(item.payload);
      if (!payload) {
        continue;
      }
      byAudience[payload.audience] += 1;
    }
    return {
      immediateBroadcasts,
      scheduledBroadcasts: scheduled,
      scheduledPending: Math.max(
        0,
        scheduled - scheduledSent - scheduledFailed - scheduledCancelled,
      ),
      scheduledSent,
      scheduledFailed,
      scheduledCancelled,
      reminderDeliveries: remindersSent,
      byAudience,
    };
  }

  async getRecentDeliveries(query: AdminListDeliveriesQueryDto = {}) {
    const hasPagination =
      query.take !== undefined || query.offset !== undefined;
    const where = {
      action: ACTION_NOTIFICATION_DELIVERY,
      entityType: 'Notification',
    };
    const orderBy = { createdAt: 'desc' as const };
    const take = query.take ?? DEFAULT_LIST_PAGE_SIZE;
    const offset = query.offset ?? 0;

    if (!hasPagination) {
      const limit = 100;
      const deliveries = await this.prisma.auditLog.findMany({
        where,
        orderBy,
        take: limit,
      });
      return this.mapDeliveryRows(deliveries);
    }

    if (requiresDeliveriesPostProcessing(query)) {
      const deliveries = await this.prisma.auditLog.findMany({
        where,
        orderBy,
        take: NOTIFICATIONS_FILTER_SCAN_LIMIT,
      });
      const mapped = this.mapDeliveryRows(deliveries);
      return paginateFilteredRows(
        filterDeliveryRows(mapped, query),
        take,
        offset,
      );
    }

    const [deliveries, total] = await Promise.all([
      this.prisma.auditLog.findMany({ where, orderBy, take, skip: offset }),
      this.prisma.auditLog.count({ where }),
    ]);
    return {
      items: this.mapDeliveryRows(deliveries),
      total,
      take,
      offset,
    };
  }

  async getCampaignAnalytics(days: number) {
    const safeDays = Math.min(Math.max(days, 1), 90);
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - safeDays + 1);
    from.setHours(0, 0, 0, 0);

    const [broadcasts, deliveries] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: {
          entityType: 'Notification',
          action: { in: [ACTION_BROADCAST, ACTION_BROADCAST_SCHEDULED_SENT] },
          createdAt: { gte: from, lte: to },
        },
        orderBy: { createdAt: 'asc' },
        take: 5000,
      }),
      this.prisma.auditLog.findMany({
        where: {
          entityType: 'Notification',
          action: ACTION_NOTIFICATION_DELIVERY,
          createdAt: { gte: from, lte: to },
        },
        orderBy: { createdAt: 'asc' },
        take: 10000,
      }),
    ]);

    const deliveriesByDate = new Map<string, number>();
    const deliveriesBySubject = new Map<string, number>();
    const channelBreakdown = new Map<string, number>();
    for (const item of deliveries) {
      const payload = parseDeliveryPayload(item.payload);
      const date = item.createdAt.toISOString().slice(0, 10);
      deliveriesByDate.set(date, (deliveriesByDate.get(date) ?? 0) + 1);
      if (payload?.channel) {
        channelBreakdown.set(
          payload.channel,
          (channelBreakdown.get(payload.channel) ?? 0) + 1,
        );
      }
      if (payload?.subject) {
        deliveriesBySubject.set(
          payload.subject,
          (deliveriesBySubject.get(payload.subject) ?? 0) + 1,
        );
      }
    }

    const campaignsBySubject = new Map<string, number>();
    const recipientsBySubject = new Map<string, number>();
    const campaignsByDate = new Map<string, number>();
    let scheduledCampaigns = 0;
    let totalEstimatedRecipients = 0;
    for (const item of broadcasts) {
      const date = item.createdAt.toISOString().slice(0, 10);
      campaignsByDate.set(date, (campaignsByDate.get(date) ?? 0) + 1);
      const payload = parseBroadcastCampaignPayload(item.payload);
      const subject = payload?.subject ?? 'Scheduled campaign';
      campaignsBySubject.set(
        subject,
        (campaignsBySubject.get(subject) ?? 0) + 1,
      );
      const recipients = payload?.recipientCount ?? 0;
      recipientsBySubject.set(
        subject,
        (recipientsBySubject.get(subject) ?? 0) + recipients,
      );
      totalEstimatedRecipients += recipients;
      if (item.action === ACTION_BROADCAST_SCHEDULED_SENT) {
        scheduledCampaigns += 1;
      }
    }

    const daily = composeDailyRows({
      from,
      to,
      campaignsByDate,
      deliveriesByDate,
    });
    const topSubjects = [...campaignsBySubject.entries()]
      .map(([subject, campaigns]) => {
        const deliveriesCount = deliveriesBySubject.get(subject) ?? 0;
        const estimatedRecipients = recipientsBySubject.get(subject) ?? 0;
        return {
          subject,
          campaigns,
          deliveries: deliveriesCount,
          estimatedRecipients,
          conversionRatePct:
            estimatedRecipients > 0
              ? Math.round((deliveriesCount / estimatedRecipients) * 100)
              : 0,
        };
      })
      .sort((a, b) => b.deliveries - a.deliveries || b.campaigns - a.campaigns)
      .slice(0, 5);
    const channelRows = [...channelBreakdown.entries()]
      .map(([channel, deliveriesCount]) => ({
        channel,
        deliveries: deliveriesCount,
      }))
      .sort((a, b) => b.deliveries - a.deliveries);
    const immediateCampaigns = Math.max(
      0,
      broadcasts.length - scheduledCampaigns,
    );
    const deliveryRatePct =
      totalEstimatedRecipients > 0
        ? Math.round((deliveries.length / totalEstimatedRecipients) * 100)
        : 0;

    return {
      range: { from: from.toISOString(), to: to.toISOString(), days: safeDays },
      summary: {
        campaignsTotal: broadcasts.length,
        deliveriesTotal: deliveries.length,
        averageRecipientsPerCampaign:
          broadcasts.length > 0
            ? Math.round(totalEstimatedRecipients / broadcasts.length)
            : 0,
      },
      funnel: {
        campaignsTotal: broadcasts.length,
        scheduledCampaigns,
        immediateCampaigns,
        estimatedRecipientsTotal: totalEstimatedRecipients,
        deliveredRecipientsTotal: deliveries.length,
        deliveryRatePct,
      },
      channelBreakdown: channelRows,
      topSubjects,
      daily,
    };
  }

  private mapDeliveryRows(
    deliveries: Array<{ id: string; createdAt: Date; payload: string | null }>,
  ) {
    return deliveries.map((item) => {
      const payload = parseDeliveryPayload(item.payload);
      return {
        id: item.id,
        createdAt: item.createdAt.toISOString(),
        recipientEmail: payload?.recipientEmail ?? '',
        channel: payload?.channel ?? 'email',
        audience: payload?.audience ?? 'users',
        subject: payload?.subject ?? '',
        scheduled: payload?.scheduled ?? false,
      };
    });
  }
}
