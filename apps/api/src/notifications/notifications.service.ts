import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingStatus, Role } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

const REMINDER_HOURS_BEFORE = 2;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async sendClassReminders(): Promise<void> {
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
      const prefs = b.user.notificationPrefs;
      if (prefs && !prefs.bookingReminders) {
        continue;
      }
      await this.mail.sendEmail({
        to: b.user.email,
        subject: `Reminder: ${b.session.classType.name}`,
        html: `<p>Your class starts soon (${REMINDER_HOURS_BEFORE}h).</p>`,
      });
    }
    if (bookings.length > 0) {
      this.logger.log(`Sent up to ${bookings.length} class reminders`);
    }
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
    return { ok: true, count: users.length };
  }
}
