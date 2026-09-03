import { Injectable, Logger } from '@nestjs/common';
import { ClassSessionStatus, WaitlistStatus } from '@prisma/client';
import {
  buildMemberWaitlistsUrl,
  resolveEmailLocale,
  resolveWebAppUrl,
} from '../mail/email-app-urls';
import { MailService } from '../mail/mail.service';
import {
  buildWaitlistOfferSubject,
  renderWaitlistOfferEmail,
} from '../mail/templates/waitlist-emails.template';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimePublisherService } from '../realtime/realtime-publisher.service';
import { StudioService } from '../studio/studio.service';
import { WhatsappNotifyService } from '../whatsapp/whatsapp-notify.service';
import { renderWaitlistOfferWhatsapp } from '../whatsapp/whatsapp-schedule-templates';
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
    private readonly whatsapp: WhatsappNotifyService,
  ) {
    this.waitlistCronEnabled = this.isEnabledEnv(
      process.env.ENABLE_WAITLIST_BACKGROUND_JOBS,
    );
  }

  async offerNextIfSlot(sessionId: string): Promise<void> {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: { classType: { select: { name: true } } },
    });
    if (
      !session ||
      session.status === ClassSessionStatus.CANCELLED ||
      session.status === ClassSessionStatus.FINISHED ||
      session.endsAt.getTime() <= Date.now()
    ) {
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
    await this.sendOfferEmail({
      to: next.user.email,
      locale: next.user.locale,
      className: session.classType.name,
      offerMinutes: minutes,
    });
    await this.whatsapp.trySendToUser({
      userId: next.userId,
      topic: 'waitlistAlerts',
      render: (locale) => renderWaitlistOfferWhatsapp(locale),
    });
    this.realtime.emitWaitlistOffer(next.userId, sessionId);
  }

  /** Invoked by CronBatchService (every 30 min). */
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

  /** Drops open waitlist rows when admin cancels the class. */
  async expireForCancelledSession(sessionId: string): Promise<void> {
    const open = await this.prisma.waitlistEntry.findMany({
      where: {
        sessionId,
        status: { in: [WaitlistStatus.ACTIVE, WaitlistStatus.OFFERED] },
      },
      select: { userId: true },
    });
    if (open.length === 0) {
      return;
    }
    await this.prisma.waitlistEntry.updateMany({
      where: {
        sessionId,
        status: { in: [WaitlistStatus.ACTIVE, WaitlistStatus.OFFERED] },
      },
      data: { status: WaitlistStatus.EXPIRED },
    });
    for (const entry of open) {
      this.realtime.emitWaitlistChanged(entry.userId, sessionId);
    }
  }

  private async sendOfferEmail(params: {
    to: string;
    locale: string | null | undefined;
    className: string;
    offerMinutes: number;
  }): Promise<void> {
    const waitlistsUrl = buildMemberWaitlistsUrl(
      resolveWebAppUrl(process.env.WEB_APP_URL),
      resolveEmailLocale(params.locale ?? undefined),
    );
    await this.mail.sendEmail({
      to: params.to,
      subject: buildWaitlistOfferSubject(params.className),
      html: renderWaitlistOfferEmail({
        className: params.className,
        offerMinutes: params.offerMinutes,
        waitlistsUrl,
      }),
    });
  }

  private isEnabledEnv(raw: string | undefined): boolean {
    if (!raw) {
      return false;
    }
    const normalized = raw.trim().toLowerCase();
    return normalized === '1' || normalized === 'true';
  }
}
