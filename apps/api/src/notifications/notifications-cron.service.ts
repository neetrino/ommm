import { Injectable, Logger } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { ExpoPushService, loadPushTokensForUser } from './expo-push.service';
import {
  buildMemberBookingsUrl,
  resolveEmailLocale,
  resolveWebAppUrl,
} from '../mail/email-app-urls';
import { MailService } from '../mail/mail.service';
import {
  buildClassReminderSubject,
  renderClassReminderEmail,
} from '../mail/templates/class-reminder.template';
import { formatPaymentDateTime } from '../payments/payment-email-format.util';
import { PrismaService } from '../prisma/prisma.service';
import {
  ACTION_BROADCAST_SCHEDULED,
  ACTION_BROADCAST_SCHEDULED_FAILED,
  ACTION_BROADCAST_SCHEDULED_SENT,
  ENABLE_BACKGROUND_REMINDERS_ENV,
  REMINDER_HOURS_BEFORE,
  SCHEDULED_TIMELINE_ACTIONS,
} from './notifications-audit.constants';
import { WhatsappNotifyService } from '../whatsapp/whatsapp-notify.service';
import { formatWhatsappDateTime } from '../whatsapp/whatsapp-locale';
import { renderClassReminderWhatsapp } from '../whatsapp/whatsapp-schedule-templates';
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
    private readonly whatsapp: WhatsappNotifyService,
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

    for (const booking of bookings) {
      await this.deliverClassReminder(booking);
    }
    if (bookings.length > 0) {
      this.logger.log(`Sent up to ${bookings.length} class reminders`);
    }
  }

  private async deliverClassReminder(booking: {
    id: string;
    user: {
      id: string;
      email: string;
      locale: string;
      notificationPrefs: { bookingReminders: boolean } | null;
    };
    session: { startsAt: Date; classType: { name: string } };
  }): Promise<void> {
    const sentAlready = await this.prisma.classReminderSendLog.findUnique({
      where: { bookingId: booking.id },
    });
    if (sentAlready) {
      return;
    }
    const prefs = booking.user.notificationPrefs;
    if (prefs && !prefs.bookingReminders) {
      return;
    }

    const className = booking.session.classType.name;
    await this.mail.sendEmail({
      to: booking.user.email,
      subject: buildClassReminderSubject(className),
      html: renderClassReminderEmail({
        className,
        hoursBefore: REMINDER_HOURS_BEFORE,
        startsAtLabel: formatPaymentDateTime(booking.session.startsAt),
        bookingsUrl: buildMemberBookingsUrl(
          resolveWebAppUrl(process.env.WEB_APP_URL),
          resolveEmailLocale(booking.user.locale ?? undefined),
        ),
      }),
    });
    const tokens = await loadPushTokensForUser(this.prisma, booking.user.id);
    if (tokens.length > 0) {
      await this.expoPush.send(
        tokens.map((to) => ({
          to,
          title: buildClassReminderSubject(className),
          body: `${className} starts in about ${REMINDER_HOURS_BEFORE} hours.`,
        })),
      );
    }
    await this.sendClassReminderWhatsapp(booking, className);
    await this.prisma.classReminderSendLog.create({
      data: { bookingId: booking.id },
    });
  }

  private async sendClassReminderWhatsapp(
    booking: {
      user: { id: string; locale: string };
      session: { startsAt: Date };
    },
    className: string,
  ): Promise<void> {
    await this.whatsapp.trySendToUser({
      userId: booking.user.id,
      topic: 'bookingReminders',
      render: (locale) =>
        renderClassReminderWhatsapp(locale, {
          className,
          hoursBefore: REMINDER_HOURS_BEFORE,
          startsAtLabel: formatWhatsappDateTime(
            booking.session.startsAt,
            locale,
          ),
        }),
    });
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
