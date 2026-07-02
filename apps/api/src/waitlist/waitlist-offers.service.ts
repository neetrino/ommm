import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClassSessionStatus, WaitlistStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimePublisherService } from '../realtime/realtime-publisher.service';
import { StudioService } from '../studio/studio.service';
import { WaitlistCapacityService } from './waitlist-capacity.service';

@Injectable()
export class WaitlistOffersService {
  private readonly logger = new Logger(WaitlistOffersService.name);
  private readonly waitlistCronEnabled: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly studio: StudioService,
    private readonly capacity: WaitlistCapacityService,
    private readonly realtime: RealtimePublisherService,
  ) {
    this.waitlistCronEnabled = this.isEnabledEnv(
      process.env.ENABLE_WAITLIST_BACKGROUND_JOBS,
    );
  }

  async offerNextIfSlot(sessionId: string): Promise<void> {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.status === ClassSessionStatus.CANCELLED) {
      return;
    }
    const n = await this.capacity.bookedCount(sessionId);
    if (n >= session.capacity) {
      return;
    }
    const now = new Date();
    await this.prisma.waitlistEntry.updateMany({
      where: {
        sessionId,
        status: WaitlistStatus.OFFERED,
        offerExpiresAt: { lte: now },
      },
      data: { status: WaitlistStatus.EXPIRED },
    });
    const hasOpenOffer = await this.prisma.waitlistEntry.findFirst({
      where: {
        sessionId,
        status: WaitlistStatus.OFFERED,
        OR: [{ offerExpiresAt: null }, { offerExpiresAt: { gt: now } }],
      },
      select: { id: true },
    });
    if (hasOpenOffer) {
      return;
    }
    const next = await this.prisma.waitlistEntry.findFirst({
      where: { sessionId, status: WaitlistStatus.ACTIVE },
      orderBy: { position: 'asc' },
      include: { user: true },
    });
    if (!next) {
      return;
    }
    const settings = await this.studio.getPublic();
    const minutes = settings.waitlistOfferMinutes ?? 30;
    const offerExpiresAt = new Date(now.getTime() + minutes * 60 * 1000);
    await this.prisma.waitlistEntry.update({
      where: { id: next.id },
      data: {
        status: WaitlistStatus.OFFERED,
        offeredAt: new Date(),
        offerExpiresAt,
      },
    });
    const webUrl = process.env.WEB_APP_URL ?? 'http://localhost:3000';
    const link = `${webUrl}/hy/account/classes/${sessionId}`;
    await this.mail.sendEmail({
      to: next.user.email,
      subject: 'A spot opened — book now',
      html: `<p>A place opened for your class.</p><p><a href="${link}">Book</a></p><p>Offer expires in ${minutes} minutes.</p>`,
    });
    this.realtime.emitWaitlistOffer(next.userId, sessionId);
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async expireOffersCron(): Promise<void> {
    if (!this.waitlistCronEnabled) {
      return;
    }
    await this.expireStaleOffersAndPromote();
  }

  async expireStaleOffersAndPromote(): Promise<void> {
    const now = new Date();
    const stale = await this.prisma.waitlistEntry.findMany({
      where: {
        status: WaitlistStatus.OFFERED,
        offerExpiresAt: { lt: now },
      },
      select: { id: true, sessionId: true },
    });
    if (stale.length === 0) {
      return;
    }
    await this.prisma.waitlistEntry.updateMany({
      where: { id: { in: stale.map((s) => s.id) } },
      data: { status: WaitlistStatus.EXPIRED },
    });
    const sessionIds = [...new Set(stale.map((s) => s.sessionId))];
    for (const sid of sessionIds) {
      await this.offerNextIfSlot(sid);
    }
    this.logger.log(
      `Expired ${stale.length} waitlist offer(s); re-offered where slots remain.`,
    );
  }

  private isEnabledEnv(raw: string | undefined): boolean {
    if (!raw) {
      return false;
    }
    const normalized = raw.trim().toLowerCase();
    return normalized === '1' || normalized === 'true';
  }
}
