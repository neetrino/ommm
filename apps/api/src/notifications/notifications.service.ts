import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingStatus, Role } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { ExpoPushService, loadPushTokensForUser } from './expo-push.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { BroadcastAudience } from './dto/broadcast.dto';
import { randomUUID } from 'node:crypto';

const REMINDER_HOURS_BEFORE = 2;
const ENABLE_BACKGROUND_REMINDERS_ENV = 'ENABLE_BACKGROUND_REMINDERS';
const ACTION_BROADCAST = 'NOTIFICATION_BROADCAST';
const ACTION_NOTIFICATION_DELIVERY = 'NOTIFICATION_DELIVERY';
const ACTION_BROADCAST_SCHEDULED = 'NOTIFICATION_BROADCAST_SCHEDULED';
const ACTION_BROADCAST_SCHEDULED_UPDATED = 'NOTIFICATION_BROADCAST_SCHEDULED_UPDATED';
const ACTION_BROADCAST_SCHEDULED_CANCELLED = 'NOTIFICATION_BROADCAST_SCHEDULED_CANCELLED';
const ACTION_BROADCAST_SCHEDULED_SENT = 'NOTIFICATION_BROADCAST_SCHEDULED_SENT';
const ACTION_BROADCAST_SCHEDULED_FAILED = 'NOTIFICATION_BROADCAST_SCHEDULED_FAILED';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly remindersCronEnabled: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly expoPush: ExpoPushService,
    private readonly audit: AuditService,
  ) {
    this.remindersCronEnabled = this.isEnabledEnv(
      process.env[ENABLE_BACKGROUND_REMINDERS_ENV],
    );
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async sendClassReminders(): Promise<void> {
    if (!this.remindersCronEnabled) {
      return;
    }
    const now = Date.now();
    const windowStart = new Date(now + REMINDER_HOURS_BEFORE * 60 * 60 * 1000);
    const windowEnd = new Date(windowStart.getTime() + 35 * 60 * 1000);

    const bookings = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.BOOKED,
        session: {
          startsAt: { gte: windowStart, lte: windowEnd },
        },
      },
      include: {
        user: {
          include: { notificationPrefs: true },
        },
        session: { include: { classType: true } },
      },
      take: 200,
    });

    for (const b of bookings) {
      const sentAlready = await this.prisma.classReminderSendLog.findUnique({
        where: { bookingId: b.id },
      });
      if (sentAlready) {
        continue;
      }
      const prefs = b.user.notificationPrefs;
      if (prefs && !prefs.bookingReminders) {
        continue;
      }
      await this.mail.sendEmail({
        to: b.user.email,
        subject: `Reminder: ${b.session.classType.name}`,
        html: `<p>Your class starts soon (${REMINDER_HOURS_BEFORE}h).</p>`,
      });
      const tokens = await loadPushTokensForUser(this.prisma, b.user.id);
      if (tokens.length > 0) {
        await this.expoPush.send(
          tokens.map((to) => ({
            to,
            title: `Reminder: ${b.session.classType.name}`,
            body: `Your class starts in about ${REMINDER_HOURS_BEFORE} hours.`,
          })),
        );
      }
      await this.prisma.classReminderSendLog.create({
        data: { bookingId: b.id },
      });
    }
    if (bookings.length > 0) {
      this.logger.log(`Sent up to ${bookings.length} class reminders`);
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async dispatchScheduledBroadcasts(): Promise<void> {
    const scheduled = await this.prisma.auditLog.findMany({
      where: { action: ACTION_BROADCAST_SCHEDULED, entityType: 'Notification' },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
    const scheduledIds = scheduled.map((entry) => entry.entityId);
    const timeline = await this.prisma.auditLog.findMany({
      where: {
        entityType: 'Notification',
        entityId: { in: scheduledIds },
        action: {
          in: [
            ACTION_BROADCAST_SCHEDULED_UPDATED,
            ACTION_BROADCAST_SCHEDULED_CANCELLED,
            ACTION_BROADCAST_SCHEDULED_SENT,
            ACTION_BROADCAST_SCHEDULED_FAILED,
          ],
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 1000,
    });
    const timelineByEntityId = this.groupTimelineByEntityId(timeline);
    for (const item of scheduled) {
      const payload = this.resolveEffectiveScheduledPayload(
        item.payload,
        timelineByEntityId.get(item.entityId) ?? [],
      );
      if (!payload || new Date(payload.scheduleAt) > new Date()) {
        continue;
      }
      const timelineForItem = timelineByEntityId.get(item.entityId) ?? [];
      if (this.hasScheduledTerminalStatus(timelineForItem)) {
        continue;
      }
      try {
        const sent = await this.broadcastToAll(payload.subject, payload.html, {
          audience: payload.audience,
          onlyPromotionsOptIn: payload.onlyPromotionsOptIn,
          scheduleEntityId: item.entityId,
        });
        await this.audit.log({
          actorRole: 'ADMIN',
          action: ACTION_BROADCAST_SCHEDULED_SENT,
          entityType: 'Notification',
          entityId: item.entityId,
          payload: {
            scheduledFor: payload.scheduleAt,
            sentCount: sent.count ?? 0,
          },
        });
      } catch (error) {
        this.logger.error(
          `Scheduled broadcast dispatch failed for ${item.id}`,
          error instanceof Error ? error.stack : undefined,
        );
        await this.audit.log({
          actorRole: 'ADMIN',
          action: ACTION_BROADCAST_SCHEDULED_FAILED,
          entityType: 'Notification',
          entityId: item.entityId,
          payload: {
            scheduledFor: payload.scheduleAt,
            error: error instanceof Error ? error.message : 'unknown',
          },
        });
      }
    }
  }

  private isEnabledEnv(raw: string | undefined): boolean {
    if (!raw) {
      return false;
    }
    const normalized = raw.trim().toLowerCase();
    return normalized === '1' || normalized === 'true';
  }

  async broadcastToAll(
    subject: string,
    html: string,
    options: {
      testTo?: string;
      audience: BroadcastAudience;
      onlyPromotionsOptIn: boolean;
      scheduleEntityId?: string;
    },
  ) {
    if (options.testTo) {
      await this.mail.sendEmail({ to: options.testTo, subject, html });
      return { ok: true, mode: 'test' };
    }
    const roles = this.resolveAudienceRoles(options.audience);
    const users = await this.prisma.user.findMany({
      where: {
        role: { in: roles },
        ...(options.onlyPromotionsOptIn && roles.includes(Role.USER)
          ? { notificationPrefs: { is: { promotions: true } } }
          : {}),
      },
      select: { email: true },
      take: 500,
    });
    for (const u of users) {
      await this.mail.sendEmail({ to: u.email, subject, html });
      await this.audit.log({
        actorRole: 'ADMIN',
        action: ACTION_NOTIFICATION_DELIVERY,
        entityType: 'Notification',
        entityId: options.scheduleEntityId ?? 'immediate',
        payload: {
          recipientEmail: u.email,
          channel: 'email',
          audience: options.audience,
          scheduled: options.scheduleEntityId !== undefined,
          subject,
        },
      });
    }
    await this.audit.log({
      actorRole: 'ADMIN',
      action: ACTION_BROADCAST,
      entityType: 'Notification',
      entityId: 'broadcast',
      payload: {
        subject,
        recipientCount: users.length,
        audience: options.audience,
        onlyPromotionsOptIn: options.onlyPromotionsOptIn,
      },
    });
    return { ok: true, count: users.length };
  }

  async scheduleBroadcast(
    actorId: string,
    params: {
      subject: string;
      html: string;
      audience: BroadcastAudience;
      onlyPromotionsOptIn: boolean;
      scheduleAt: string;
    },
  ) {
    const scheduledFor = new Date(params.scheduleAt);
    if (Number.isNaN(scheduledFor.getTime()) || scheduledFor <= new Date()) {
      return this.broadcastToAll(params.subject, params.html, {
        audience: params.audience,
        onlyPromotionsOptIn: params.onlyPromotionsOptIn,
      });
    }
    const entityId = randomUUID();
    await this.audit.log({
      actorId,
      actorRole: 'ADMIN',
      action: ACTION_BROADCAST_SCHEDULED,
      entityType: 'Notification',
      entityId,
      payload: {
        subject: params.subject,
        html: params.html,
        audience: params.audience,
        onlyPromotionsOptIn: params.onlyPromotionsOptIn,
        scheduleAt: scheduledFor.toISOString(),
      },
    });
    return {
      ok: true,
      mode: 'scheduled',
      scheduledFor: scheduledFor.toISOString(),
      scheduleId: entityId,
    };
  }

  async listScheduledBroadcasts() {
    const scheduled = await this.prisma.auditLog.findMany({
      where: { action: ACTION_BROADCAST_SCHEDULED, entityType: 'Notification' },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    const timeline = await this.prisma.auditLog.findMany({
      where: {
        entityType: 'Notification',
        entityId: { in: scheduled.map((item) => item.entityId) },
        action: {
          in: [
            ACTION_BROADCAST_SCHEDULED_UPDATED,
            ACTION_BROADCAST_SCHEDULED_CANCELLED,
            ACTION_BROADCAST_SCHEDULED_SENT,
            ACTION_BROADCAST_SCHEDULED_FAILED,
          ],
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 2000,
    });
    const timelineByEntityId = this.groupTimelineByEntityId(timeline);
    return scheduled.map((item) => {
      const timelineForItem = timelineByEntityId.get(item.entityId) ?? [];
      const effective = this.resolveEffectiveScheduledPayload(
        item.payload,
        timelineForItem,
      );
      const status = this.resolveScheduledStatus(timelineForItem);
      return {
        id: item.entityId,
        status,
        createdAt: item.createdAt.toISOString(),
        updatedAt:
          timelineForItem[timelineForItem.length - 1]?.createdAt.toISOString() ??
          item.createdAt.toISOString(),
        ...(effective ?? {
          subject: '',
          html: '',
          audience: BroadcastAudience.USERS,
          onlyPromotionsOptIn: false,
          scheduleAt: item.createdAt.toISOString(),
        }),
      };
    });
  }

  async updateScheduledBroadcast(
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
    const base = await this.prisma.auditLog.findFirst({
      where: {
        action: ACTION_BROADCAST_SCHEDULED,
        entityType: 'Notification',
        entityId: id,
      },
    });
    if (!base) {
      throw new NotFoundException('Scheduled broadcast not found');
    }
    const timeline = await this.prisma.auditLog.findMany({
      where: {
        entityType: 'Notification',
        entityId: id,
        action: {
          in: [
            ACTION_BROADCAST_SCHEDULED_UPDATED,
            ACTION_BROADCAST_SCHEDULED_CANCELLED,
            ACTION_BROADCAST_SCHEDULED_SENT,
            ACTION_BROADCAST_SCHEDULED_FAILED,
          ],
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
    if (this.hasScheduledTerminalStatus(timeline)) {
      throw new BadRequestException('Cannot update non-pending scheduled broadcast');
    }
    const effective = this.resolveEffectiveScheduledPayload(base.payload, timeline);
    if (!effective) {
      throw new BadRequestException('Invalid scheduled broadcast payload');
    }
    const next = {
      subject: changes.subject ?? effective.subject,
      html: changes.html ?? effective.html,
      audience: changes.audience ?? effective.audience,
      onlyPromotionsOptIn:
        changes.onlyPromotionsOptIn ?? effective.onlyPromotionsOptIn,
      scheduleAt: changes.scheduleAt ?? effective.scheduleAt,
    };
    await this.audit.log({
      actorId,
      actorRole: 'ADMIN',
      action: ACTION_BROADCAST_SCHEDULED_UPDATED,
      entityType: 'Notification',
      entityId: id,
      payload: next,
    });
    return { ok: true };
  }

  async cancelScheduledBroadcast(actorId: string, id: string) {
    const base = await this.prisma.auditLog.findFirst({
      where: {
        action: ACTION_BROADCAST_SCHEDULED,
        entityType: 'Notification',
        entityId: id,
      },
    });
    if (!base) {
      throw new NotFoundException('Scheduled broadcast not found');
    }
    const timeline = await this.prisma.auditLog.findMany({
      where: {
        entityType: 'Notification',
        entityId: id,
        action: {
          in: [
            ACTION_BROADCAST_SCHEDULED_CANCELLED,
            ACTION_BROADCAST_SCHEDULED_SENT,
            ACTION_BROADCAST_SCHEDULED_FAILED,
          ],
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    if (this.hasScheduledTerminalStatus(timeline)) {
      throw new BadRequestException('Scheduled broadcast is already closed');
    }
    await this.audit.log({
      actorId,
      actorRole: 'ADMIN',
      action: ACTION_BROADCAST_SCHEDULED_CANCELLED,
      entityType: 'Notification',
      entityId: id,
      payload: { reason: 'Cancelled by admin' },
    });
    return { ok: true };
  }

  async getAdminStats() {
    const [
      scheduled,
      scheduledSent,
      scheduledFailed,
      immediateBroadcasts,
      remindersSent,
      scheduledCancelled,
      recentBroadcasts,
    ] =
      await Promise.all([
        this.prisma.auditLog.count({
          where: { action: ACTION_BROADCAST_SCHEDULED, entityType: 'Notification' },
        }),
        this.prisma.auditLog.count({
          where: { action: ACTION_BROADCAST_SCHEDULED_SENT, entityType: 'Notification' },
        }),
        this.prisma.auditLog.count({
          where: { action: ACTION_BROADCAST_SCHEDULED_FAILED, entityType: 'Notification' },
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
      const payload = this.parseBroadcastPayload(item.payload);
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

  async getRecentDeliveries(limit = 100) {
    const safeLimit = Math.min(Math.max(limit, 1), 500);
    const deliveries = await this.prisma.auditLog.findMany({
      where: {
        action: ACTION_NOTIFICATION_DELIVERY,
        entityType: 'Notification',
      },
      orderBy: { createdAt: 'desc' },
      take: safeLimit,
    });
    return deliveries.map((item) => {
      const payload = this.parseDeliveryPayload(item.payload);
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
    for (const item of deliveries) {
      const payload = this.parseDeliveryPayload(item.payload);
      const date = item.createdAt.toISOString().slice(0, 10);
      deliveriesByDate.set(date, (deliveriesByDate.get(date) ?? 0) + 1);
      if (payload?.subject) {
        deliveriesBySubject.set(
          payload.subject,
          (deliveriesBySubject.get(payload.subject) ?? 0) + 1,
        );
      }
    }

    const campaignsBySubject = new Map<string, number>();
    const campaignsByDate = new Map<string, number>();
    let totalEstimatedRecipients = 0;
    for (const item of broadcasts) {
      const date = item.createdAt.toISOString().slice(0, 10);
      campaignsByDate.set(date, (campaignsByDate.get(date) ?? 0) + 1);
      const payload = this.parseBroadcastCampaignPayload(item.payload);
      const subject = payload?.subject ?? 'Scheduled campaign';
      campaignsBySubject.set(subject, (campaignsBySubject.get(subject) ?? 0) + 1);
      totalEstimatedRecipients += payload?.recipientCount ?? 0;
    }

    const daily = this.composeDailyRows({
      from,
      to,
      campaignsByDate,
      deliveriesByDate,
    });
    const topSubjects = [...campaignsBySubject.entries()]
      .map(([subject, campaigns]) => ({
        subject,
        campaigns,
        deliveries: deliveriesBySubject.get(subject) ?? 0,
      }))
      .sort((a, b) => b.deliveries - a.deliveries || b.campaigns - a.campaigns)
      .slice(0, 5);

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
      topSubjects,
      daily,
    };
  }

  private resolveAudienceRoles(audience: BroadcastAudience): Role[] {
    if (audience === BroadcastAudience.COACHES) {
      return [Role.COACH];
    }
    if (audience === BroadcastAudience.STAFF) {
      return [Role.COACH, Role.MANAGER, Role.CONTENT_ADMIN, Role.ADMIN];
    }
    if (audience === BroadcastAudience.ALL) {
      return [
        Role.USER,
        Role.COACH,
        Role.MANAGER,
        Role.CONTENT_ADMIN,
        Role.ADMIN,
      ];
    }
    return [Role.USER];
  }

  private parseScheduledPayload(rawPayload: string | null): {
    subject: string;
    html: string;
    audience: BroadcastAudience;
    onlyPromotionsOptIn: boolean;
    scheduleAt: string;
  } | null {
    if (!rawPayload) {
      return null;
    }
    try {
      const parsed = JSON.parse(rawPayload) as Partial<{
        subject: string;
        html: string;
        audience: BroadcastAudience;
        onlyPromotionsOptIn: boolean;
        scheduleAt: string;
      }>;
      if (
        !parsed.subject ||
        !parsed.html ||
        !parsed.audience ||
        !parsed.scheduleAt
      ) {
        return null;
      }
      return {
        subject: parsed.subject,
        html: parsed.html,
        audience: parsed.audience,
        onlyPromotionsOptIn: parsed.onlyPromotionsOptIn === true,
        scheduleAt: parsed.scheduleAt,
      };
    } catch {
      return null;
    }
  }

  private parseBroadcastPayload(rawPayload: string | null): {
    audience: 'users' | 'coaches' | 'staff' | 'all';
  } | null {
    if (!rawPayload) {
      return null;
    }
    try {
      const parsed = JSON.parse(rawPayload) as Partial<{
        audience: 'users' | 'coaches' | 'staff' | 'all';
      }>;
      if (!parsed.audience) {
        return null;
      }
      return { audience: parsed.audience };
    } catch {
      return null;
    }
  }

  private parseBroadcastCampaignPayload(rawPayload: string | null): {
    subject: string;
    recipientCount: number;
  } | null {
    if (!rawPayload) {
      return null;
    }
    try {
      const parsed = JSON.parse(rawPayload) as Partial<{
        subject: string;
        recipientCount: number;
        sentCount: number;
      }>;
      if (typeof parsed.subject !== 'string') {
        return null;
      }
      return {
        subject: parsed.subject,
        recipientCount:
          typeof parsed.recipientCount === 'number'
            ? parsed.recipientCount
            : typeof parsed.sentCount === 'number'
              ? parsed.sentCount
              : 0,
      };
    } catch {
      return null;
    }
  }

  private parseDeliveryPayload(rawPayload: string | null): {
    recipientEmail: string;
    channel: string;
    audience: 'users' | 'coaches' | 'staff' | 'all';
    scheduled: boolean;
    subject: string;
  } | null {
    if (!rawPayload) {
      return null;
    }
    try {
      const parsed = JSON.parse(rawPayload) as Partial<{
        recipientEmail: string;
        channel: string;
        audience: 'users' | 'coaches' | 'staff' | 'all';
        scheduled: boolean;
        subject: string;
      }>;
      if (
        !parsed.recipientEmail ||
        !parsed.channel ||
        !parsed.audience ||
        !parsed.subject
      ) {
        return null;
      }
      return {
        recipientEmail: parsed.recipientEmail,
        channel: parsed.channel,
        audience: parsed.audience,
        scheduled: parsed.scheduled === true,
        subject: parsed.subject,
      };
    } catch {
      return null;
    }
  }

  private resolveScheduledStatus(
    timeline: Array<{ action: string }>,
  ): 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED' {
    if (timeline.some((item) => item.action === ACTION_BROADCAST_SCHEDULED_CANCELLED)) {
      return 'CANCELLED';
    }
    if (timeline.some((item) => item.action === ACTION_BROADCAST_SCHEDULED_SENT)) {
      return 'SENT';
    }
    if (timeline.some((item) => item.action === ACTION_BROADCAST_SCHEDULED_FAILED)) {
      return 'FAILED';
    }
    return 'PENDING';
  }

  private hasScheduledTerminalStatus(timeline: Array<{ action: string }>): boolean {
    return this.resolveScheduledStatus(timeline) !== 'PENDING';
  }

  private groupTimelineByEntityId(
    timeline: Array<{
      entityId: string;
      action: string;
      payload: string | null;
      createdAt: Date;
    }>,
  ): Map<
    string,
    Array<{ action: string; payload: string | null; createdAt: Date }>
  > {
    const grouped = new Map<
      string,
      Array<{ action: string; payload: string | null; createdAt: Date }>
    >();
    for (const item of timeline) {
      const prev = grouped.get(item.entityId) ?? [];
      prev.push({
        action: item.action,
        payload: item.payload,
        createdAt: item.createdAt,
      });
      grouped.set(item.entityId, prev);
    }
    return grouped;
  }

  private resolveEffectiveScheduledPayload(
    basePayloadRaw: string | null,
    timeline: Array<{ action: string; payload: string | null }>,
  ) {
    const base = this.parseScheduledPayload(basePayloadRaw);
    if (!base) {
      return null;
    }
    return timeline
      .filter((item) => item.action === ACTION_BROADCAST_SCHEDULED_UPDATED)
      .reduce((acc, item) => {
        const next = this.parseScheduledPayload(item.payload);
        if (!next) {
          return acc;
        }
        return next;
      }, base);
  }

  private composeDailyRows(params: {
    from: Date;
    to: Date;
    campaignsByDate: Map<string, number>;
    deliveriesByDate: Map<string, number>;
  }) {
    const rows: Array<{ date: string; campaigns: number; deliveries: number }> = [];
    const cursor = new Date(params.from);
    while (cursor <= params.to) {
      const date = cursor.toISOString().slice(0, 10);
      rows.push({
        date,
        campaigns: params.campaignsByDate.get(date) ?? 0,
        deliveries: params.deliveriesByDate.get(date) ?? 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return rows;
  }
}
