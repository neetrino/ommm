import { Injectable, Logger } from '@nestjs/common';
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
const ACTION_BROADCAST_SCHEDULED = 'NOTIFICATION_BROADCAST_SCHEDULED';
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
      where: {
        action: ACTION_BROADCAST_SCHEDULED,
        entityType: 'Notification',
      },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });
    for (const item of scheduled) {
      const payload = this.parseScheduledPayload(item.payload);
      if (!payload || new Date(payload.scheduleAt) > new Date()) {
        continue;
      }
      const sentLog = await this.prisma.auditLog.findFirst({
        where: {
          action: ACTION_BROADCAST_SCHEDULED_SENT,
          entityType: 'Notification',
          entityId: item.id,
        },
      });
      if (sentLog) {
        continue;
      }
      try {
        const sent = await this.broadcastToAll(payload.subject, payload.html, {
          audience: payload.audience,
          onlyPromotionsOptIn: payload.onlyPromotionsOptIn,
        });
        await this.audit.log({
          actorRole: 'ADMIN',
          action: ACTION_BROADCAST_SCHEDULED_SENT,
          entityType: 'Notification',
          entityId: item.id,
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
          entityId: item.id,
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
    };
  }

  async getAdminStats() {
    const [scheduled, scheduledSent, scheduledFailed, immediateBroadcasts, remindersSent] =
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
      ]);
    return {
      immediateBroadcasts,
      scheduledBroadcasts: scheduled,
      scheduledPending: Math.max(0, scheduled - scheduledSent - scheduledFailed),
      scheduledSent,
      scheduledFailed,
      reminderDeliveries: remindersSent,
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
}
