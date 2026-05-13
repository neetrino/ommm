import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingStatus, Role } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { ExpoPushService, loadPushTokensForUser } from './expo-push.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

const REMINDER_HOURS_BEFORE = 2;
const ENABLE_BACKGROUND_REMINDERS_ENV = 'ENABLE_BACKGROUND_REMINDERS';

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

  private isEnabledEnv(raw: string | undefined): boolean {
    if (!raw) {
      return false;
    }
    const normalized = raw.trim().toLowerCase();
    return normalized === '1' || normalized === 'true';
  }

  async broadcastToAll(subject: string, html: string, testTo?: string) {
    if (testTo) {
      await this.mail.sendEmail({ to: testTo, subject, html });
      return { ok: true, mode: 'test' };
    }
    const users = await this.prisma.user.findMany({
      where: { role: Role.USER },
      select: { email: true },
      take: 500,
    });
    for (const u of users) {
      await this.mail.sendEmail({ to: u.email, subject, html });
    }
    await this.audit.log({
      actorRole: 'ADMIN',
      action: 'NOTIFICATION_BROADCAST',
      entityType: 'Notification',
      entityId: 'broadcast',
      payload: { subject, recipientCount: users.length },
    });
    return { ok: true, count: users.length };
  }
}
