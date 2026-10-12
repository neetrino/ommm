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
  CLASS_REMINDER_BATCH_TAKE,
  CLASS_REMINDER_HOURS_WINDOWS,
  ENABLE_BACKGROUND_REMINDERS_ENV,
  SCHEDULED_TIMELINE_ACTIONS,
} from './notifications-audit.constants';
import {
  classReminderSessionWindow,
  notificationDueUntil,
} from './notification-send-window';
import { WhatsappNotifyService } from '../whatsapp/whatsapp-notify.service';
import { formatWhatsappDateTime } from '../whatsapp/whatsapp-locale';
import { renderClassReminderWhatsapp } from '../whatsapp/whatsapp-schedule-templates';
import { deliverDueScheduledBroadcast } from './notifications-scheduled-dispatch';
import { NotificationsBroadcastService } from './notifications-broadcast.service';
import {
  groupTimelineByEntityId,
  hasScheduledTerminalStatus,
  isEnabledEnv,
  resolveEffectiveScheduledPayload,
} from './notifications-payload.helpers';

type ClassReminderBooking = {
  id: string;
  user: {
    id: string;
    email: string;
    locale: string;
    notificationPrefs: { bookingReminders: boolean } | null;
  };
  session: { startsAt: Date; classType: { name: string } };
};

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
    if (
      !this.remindersCronEnabled &&
      process.env.JEST_WORKER_ID === undefined
    ) {
      this.logger.warn(
        'Class reminders disabled until ENABLE_BACKGROUND_REMINDERS=true',
      );
    }
  }

  /** Invoked by CronBatchService (every 30 min), only during 13:00–21:00 Yerevan. */
  async sendClassReminders(): Promise<void> {
    if (!this.remindersCronEnabled) {
      return;
    }
    const now = new Date(Date.now());
    if (notificationDueUntil(now) === null) {
      return;
    }
    for (const hoursBefore of CLASS_REMINDER_HOURS_WINDOWS) {
      await this.sendClassRemindersForWindow(now, hoursBefore);
    }
  }

  private async sendClassRemindersForWindow(
    now: Date,
    hoursBefore: number,
  ): Promise<void> {
    const window = classReminderSessionWindow(now, hoursBefore);
    if (window === null) {
      return;
    }
    const bookings = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.BOOKED,
        session: {
          startsAt: { gt: now, gte: window.start, lte: window.end },
        },
      },
      include: {
        user: { include: { notificationPrefs: true } },
        session: { include: { classType: true } },
      },
      take: CLASS_REMINDER_BATCH_TAKE,
    });
    for (const booking of bookings) {
      await this.tryDeliverClassReminder(booking, hoursBefore);
    }
    if (bookings.length > 0) {
      this.logger.log(
        `Sent up to ${bookings.length} class reminders (${hoursBefore}h)`,
      );
    }
  }

  private async tryDeliverClassReminder(
    booking: ClassReminderBooking,
    hoursBefore: number,
  ): Promise<void> {
    try {
      await this.deliverClassReminder(booking, hoursBefore);
    } catch (error) {
      this.logger.error(
        `Class reminder failed for booking ${booking.id} (${hoursBefore}h)`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async deliverClassReminder(
    booking: ClassReminderBooking,
    hoursBefore: number,
  ): Promise<void> {
    const sentAlready = await this.prisma.classReminderSendLog.findUnique({
      where: {
        bookingId_hoursBefore: { bookingId: booking.id, hoursBefore },
      },
    });
    if (sentAlready) {
      return;
    }
    const prefs = booking.user.notificationPrefs;
    if (prefs && !prefs.bookingReminders) {
      return;
    }
    const className = booking.session.classType.name;
    await this.sendClassReminderChannels(booking, className, hoursBefore);
    await this.prisma.classReminderSendLog.create({
      data: { bookingId: booking.id, hoursBefore },
    });
  }

  private async sendClassReminderChannels(
    booking: ClassReminderBooking,
    className: string,
    hoursBefore: number,
  ): Promise<void> {
    await this.mail.sendEmail({
      to: booking.user.email,
      subject: buildClassReminderSubject(className),
      html: renderClassReminderEmail({
        className,
        hoursBefore,
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
          body: `${className} starts in about ${hoursBefore} hours.`,
        })),
      );
    }
    await this.whatsapp.trySendToUser({
      userId: booking.user.id,
      topic: 'bookingReminders',
      render: (locale) =>
        renderClassReminderWhatsapp(locale, {
          className,
          hoursBefore,
          startsAtLabel: formatWhatsappDateTime(
            booking.session.startsAt,
            locale,
          ),
        }),
    });
  }

  /** Invoked by CronBatchService (every 30 min), only during 13:00–21:00 Yerevan. */
  async dispatchScheduledBroadcasts(): Promise<void> {
    const dueUntil = notificationDueUntil(new Date(Date.now()));
    if (dueUntil === null) {
      return;
    }
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
      await this.dispatchOneScheduledBroadcast(
        item,
        timelineByEntityId,
        dueUntil,
      );
    }
  }

  private async dispatchOneScheduledBroadcast(
    item: { id: string; entityId: string; payload: string | null },
    timelineByEntityId: Map<
      string,
      { action: string; payload: string | null; createdAt: Date }[]
    >,
    dueUntil: Date,
  ): Promise<void> {
    const payload = resolveEffectiveScheduledPayload(
      item.payload,
      timelineByEntityId.get(item.entityId) ?? [],
    );
    if (!payload || new Date(payload.scheduleAt) > dueUntil) {
      return;
    }
    const timelineForItem = timelineByEntityId.get(item.entityId) ?? [];
    if (hasScheduledTerminalStatus(timelineForItem)) {
      return;
    }
    await deliverDueScheduledBroadcast(
      { broadcast: this.broadcast, audit: this.audit, logger: this.logger },
      item,
      payload,
    );
  }
}
