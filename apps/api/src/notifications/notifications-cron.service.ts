import { Injectable, Logger } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { ExpoPushService, loadPushTokensForUser } from './expo-push.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ACTION_BROADCAST_SCHEDULED,
  ACTION_BROADCAST_SCHEDULED_FAILED,
  ACTION_BROADCAST_SCHEDULED_SENT,
  ENABLE_BACKGROUND_REMINDERS_ENV,
  REMINDER_HOURS_BEFORE,
  SCHEDULED_TIMELINE_ACTIONS,
} from './notifications-audit.constants';
import { NotificationsBroadcastService } from './notifications-broadcast.service';
import {
  groupTimelineByEntityId,
  hasScheduledTerminalStatus,
  isEnabledEnv,
  resolveEffectiveScheduledPayload,
} from './notifications-payload.helpers';

@Injectable()
export class NotificationsCronService {
  private readonly logger = new Logger(NotificationsCronService.name);
  private readonly remindersCronEnabled: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly expoPush: ExpoPushService,
    private readonly audit: AuditService,
    private readonly broadcast: NotificationsBroadcastService,
  ) {
    this.remindersCronEnabled = isEnabledEnv(
      process.env[ENABLE_BACKGROUND_REMINDERS_ENV],
    );
  }

  /** Invoked by CronBatchService (every 30 min). */
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

  /** Invoked by CronBatchService (every 30 min). */
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
        action: { in: [...SCHEDULED_TIMELINE_ACTIONS] },
      },
      orderBy: { createdAt: 'asc' },
      take: 1000,
    });
    const timelineByEntityId = groupTimelineByEntityId(timeline);
    for (const item of scheduled) {
      const payload = resolveEffectiveScheduledPayload(
        item.payload,
        timelineByEntityId.get(item.entityId) ?? [],
      );
      if (!payload || new Date(payload.scheduleAt) > new Date()) {
        continue;
      }
      const timelineForItem = timelineByEntityId.get(item.entityId) ?? [];
      if (hasScheduledTerminalStatus(timelineForItem)) {
        continue;
      }
      try {
        const sent = await this.broadcast.broadcastToAll(
          payload.subject,
          payload.html,
          {
            audience: payload.audience,
            onlyPromotionsOptIn: payload.onlyPromotionsOptIn,
            scheduleEntityId: item.entityId,
          },
        );
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
}
