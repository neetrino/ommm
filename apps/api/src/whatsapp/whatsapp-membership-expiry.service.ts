import { Injectable, Logger } from '@nestjs/common';
import { Prisma, UserPackageStatus } from '@prisma/client';
import {
  notificationDueSince,
  notificationDueUntil,
} from '../notifications/notification-send-window';
import { ENABLE_BACKGROUND_REMINDERS_ENV } from '../notifications/notifications-audit.constants';
import { isEnabledEnv } from '../notifications/notifications-payload.helpers';
import { PrismaService } from '../prisma/prisma.service';
import {
  MEMBERSHIP_EXPIRY_REMINDER_DAY_WINDOWS,
  WHATSAPP_CRON_BATCH_TAKE,
} from './whatsapp.constants';
import { formatWhatsappDate } from './whatsapp-locale';
import { WhatsappNotifyService } from './whatsapp-notify.service';
import { renderMembershipExpiryWhatsapp } from './whatsapp-schedule-templates';

const DAY_MS = 24 * 60 * 60 * 1000;

type ExpiryReminderPackage = {
  id: string;
  userId: string;
  planNameSnapshot: string;
  currentPeriodEnd: Date;
  user: { locale: string };
};

@Injectable()
export class WhatsappMembershipExpiryService {
  private readonly logger = new Logger(WhatsappMembershipExpiryService.name);
  private readonly cronEnabled: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notify: WhatsappNotifyService,
  ) {
    this.cronEnabled = isEnabledEnv(
      process.env[ENABLE_BACKGROUND_REMINDERS_ENV],
    );
  }

  /**
   * Invoked by CronBatchService (every 30 min).
   * One WhatsApp at 7 days and one at 1 day, only when no session is still held.
   * Sends only during 13:00–21:00 Asia/Yerevan; night dues wait for 13:00.
   */
  async sendDueReminders(): Promise<void> {
    if (!this.cronEnabled || !(await this.notify.isConfigured())) {
      return;
    }
    const now = new Date(Date.now());
    if (notificationDueUntil(now) === null) {
      return;
    }
    for (const daysBefore of MEMBERSHIP_EXPIRY_REMINDER_DAY_WINDOWS) {
      await this.sendWindow(now, daysBefore);
    }
  }

  private async sendWindow(now: Date, daysBefore: number): Promise<void> {
    const packages = await this.prisma.userPackage.findMany({
      where: unusedPackageExpiryWhere(now, daysBefore),
      select: {
        id: true,
        userId: true,
        planNameSnapshot: true,
        currentPeriodEnd: true,
        user: { select: { locale: true } },
      },
      take: WHATSAPP_CRON_BATCH_TAKE,
    });
    for (const userPackage of packages) {
      await this.deliverOne(userPackage, daysBefore);
    }
  }

  private async deliverOne(
    userPackage: ExpiryReminderPackage,
    daysBefore: number,
  ): Promise<void> {
    try {
      await this.sendAndRecord(userPackage, daysBefore);
    } catch (error) {
      this.logger.error(
        `Membership expiry reminder failed for package ${userPackage.id} (${daysBefore}d)`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async sendAndRecord(
    userPackage: ExpiryReminderPackage,
    daysBefore: number,
  ): Promise<void> {
    const result = await this.notify.trySendToUser({
      userId: userPackage.userId,
      topic: 'bookingReminders',
      idempotencyKey: `omm-wa-expiry-${userPackage.id}-${daysBefore}`,
      render: (locale) =>
        renderMembershipExpiryWhatsapp(locale, {
          planName: userPackage.planNameSnapshot,
          endsAtLabel: formatWhatsappDate(userPackage.currentPeriodEnd, locale),
        }),
    });
    if (result !== 'sent') {
      return;
    }
    await this.prisma.membershipExpiryReminderSendLog.create({
      data: { userPackageId: userPackage.id, daysBefore },
    });
  }
}

/** Active unused package whose reminder fell due since yesterday 21:00 Yerevan. */
export function unusedPackageExpiryWhere(
  now: Date,
  daysBefore: number,
): Prisma.UserPackageWhereInput {
  const dueUntil = notificationDueUntil(now) ?? now;
  const offsetMs = daysBefore * DAY_MS;
  return {
    status: UserPackageStatus.ACTIVE,
    removedAt: null,
    currentPeriodEnd: {
      gte: new Date(notificationDueSince(now).getTime() + offsetMs),
      lte: new Date(dueUntil.getTime() + offsetMs),
    },
    consumptions: { none: { restoredAt: null } },
    expiryReminderLogs: { none: { daysBefore } },
  };
}
