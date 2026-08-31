import { Injectable, Logger } from '@nestjs/common';
import {
  renderPackageCreditsLabel,
  renderPackagePurchasedWhatsapp,
} from './whatsapp-commerce-templates';
import { formatWhatsappDate, resolveWhatsappLocale } from './whatsapp-locale';
import { WhatsappNotifyService } from './whatsapp-notify.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WhatsappPackagePurchasedService {
  private readonly logger = new Logger(WhatsappPackagePurchasedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notify: WhatsappNotifyService,
  ) {}

  async tryNotify(userPackageId: string): Promise<void> {
    try {
      await this.notifyIfNeeded(userPackageId);
    } catch (error) {
      this.logger.error(
        `WhatsApp package purchased failed for ${userPackageId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async notifyIfNeeded(userPackageId: string): Promise<void> {
    const already = await this.prisma.packagePurchasedSendLog.findUnique({
      where: { userPackageId },
      select: { id: true },
    });
    if (already) {
      return;
    }
    const userPackage = await this.prisma.userPackage.findUnique({
      where: { id: userPackageId },
      select: {
        id: true,
        userId: true,
        planNameSnapshot: true,
        currentPeriodEnd: true,
        planIsUnlimitedSnapshot: true,
        sessionsRemaining: true,
        user: { select: { locale: true } },
      },
    });
    if (!userPackage) {
      return;
    }
    const locale = resolveWhatsappLocale(userPackage.user.locale);
    const result = await this.notify.trySendToUser({
      userId: userPackage.userId,
      topic: 'operational',
      text: renderPackagePurchasedWhatsapp(locale, {
        planName: userPackage.planNameSnapshot,
        endsAtLabel: formatWhatsappDate(userPackage.currentPeriodEnd, locale),
        creditsLabel: renderPackageCreditsLabel(locale, {
          unlimited: userPackage.planIsUnlimitedSnapshot,
          sessionsRemaining: userPackage.sessionsRemaining,
        }),
      }),
    });
    if (result === 'failed') {
      return;
    }
    await this.prisma.packagePurchasedSendLog.create({
      data: { userPackageId: userPackage.id },
    });
  }
}
