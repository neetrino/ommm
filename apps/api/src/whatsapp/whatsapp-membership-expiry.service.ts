import { Injectable, Logger } from '@nestjs/common';
import { UserPackageStatus } from '@prisma/client';
import { ENABLE_BACKGROUND_REMINDERS_ENV } from '../notifications/notifications-audit.constants';
import { isEnabledEnv } from '../notifications/notifications-payload.helpers';
import { PrismaService } from '../prisma/prisma.service';
import {
  MEMBERSHIP_EXPIRY_REMINDER_DAYS,
  WHATSAPP_CRON_BATCH_TAKE,
} from './whatsapp.constants';
import { formatWhatsappDate } from './whatsapp-locale';
import { WhatsappNotifyService } from './whatsapp-notify.service';
import { renderMembershipExpiryWhatsapp } from './whatsapp-schedule-templates';

const DAY_MS = 24 * 60 * 60 * 1000;

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

  /** Invoked by CronBatchService (every 30 min). */
  async sendDueReminders(): Promise<void> {
    if (!this.cronEnabled || !(await this.notify.isConfigured())) {
      return;
    }
    const now = new Date();
    const windowEnd = new Date(
      now.getTime() + MEMBERSHIP_EXPIRY_REMINDER_DAYS * DAY_MS,
    );
    const packages = await this.prisma.userPackage.findMany({
      where: {
        status: UserPackageStatus.ACTIVE,
        currentPeriodEnd: { gte: now, lte: windowEnd },
        expiryReminderLog: null,
      },
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
      await this.deliverOne(userPackage);
    }
  }

  private async deliverOne(userPackage: {
    id: string;
    userId: string;
    planNameSnapshot: string;
    currentPeriodEnd: Date;
    user: { locale: string };
  }): Promise<void> {
    const result = await this.notify.trySendToUser({
      userId: userPackage.userId,
      topic: 'bookingReminders',
      render: (locale) =>
        renderMembershipExpiryWhatsapp(locale, {
          planName: userPackage.planNameSnapshot,
          endsAtLabel: formatWhatsappDate(userPackage.currentPeriodEnd, locale),
        }),
    });
    if (result === 'failed') {
      return;
    }
    await this.prisma.membershipExpiryReminderSendLog.create({
      data: { userPackageId: userPackage.id },
    });
  }
}
