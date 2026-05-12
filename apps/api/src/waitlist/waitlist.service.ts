import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  BookingStatus,
  ClassSessionStatus,
  WaitlistStatus,
} from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { StudioService } from '../studio/studio.service';

@Injectable()
export class WaitlistService {
  private readonly logger = new Logger(WaitlistService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly studio: StudioService,
  ) {}

  async bookedCount(sessionId: string): Promise<number> {
    return this.prisma.booking.count({
      where: { sessionId, status: BookingStatus.BOOKED },
    });
  }

  async isFull(sessionId: string, capacity: number): Promise<boolean> {
    const n = await this.bookedCount(sessionId);
    return n >= capacity;
  }

  async join(userId: string, sessionId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.status === ClassSessionStatus.CANCELLED) {
      throw new NotFoundException('Session not found');
    }
    const full = await this.isFull(sessionId, session.capacity);
    if (!full) {
      throw new BadRequestException('Session is not full');
    }
    const existing = await this.prisma.waitlistEntry.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
    });
    if (existing && existing.status === WaitlistStatus.ACTIVE) {
      throw new BadRequestException('Already on waitlist');
    }
    const last = await this.prisma.waitlistEntry.findFirst({
      where: { sessionId, status: WaitlistStatus.ACTIVE },
      orderBy: { position: 'desc' },
    });
    const position = (last?.position ?? 0) + 1;
    return this.prisma.waitlistEntry.create({
      data: { userId, sessionId, position, status: WaitlistStatus.ACTIVE },
    });
  }

  async leave(userId: string, sessionId: string) {
    await this.prisma.waitlistEntry.updateMany({
      where: { userId, sessionId, status: WaitlistStatus.ACTIVE },
      data: { status: WaitlistStatus.REMOVED },
    });
    return { ok: true };
  }

  listMine(userId: string) {
    return this.prisma.waitlistEntry.findMany({
      where: {
        userId,
        status: { in: [WaitlistStatus.ACTIVE, WaitlistStatus.OFFERED] },
      },
      include: { session: { include: { classType: true, coach: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  listForSession(sessionId: string) {
    return this.prisma.waitlistEntry.findMany({
      where: { sessionId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { position: 'asc' },
    });
  }

  listAdminRecent(take: number) {
    const safeTake = Math.min(Math.max(take, 1), 500);
    return this.prisma.waitlistEntry.findMany({
      orderBy: { updatedAt: 'desc' },
      take: safeTake,
      include: {
        user: { select: { id: true, name: true, email: true } },
        session: { include: { classType: true } },
      },
    });
  }

  async offerNextIfSlot(sessionId: string): Promise<void> {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.status === ClassSessionStatus.CANCELLED) {
      return;
    }
    const n = await this.bookedCount(sessionId);
    if (n >= session.capacity) {
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
    const offerExpiresAt = new Date(Date.now() + minutes * 60 * 1000);
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
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async expireOffersCron(): Promise<void> {
    await this.expireStaleOffersAndPromote();
  }

  /**
   * Marks expired waitlist offers and attempts to offer the next person in line per session.
   */
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
    this.logger.log(`Expired ${stale.length} waitlist offer(s); re-offered where slots remain.`);
  }

  async remove(entryId: string) {
    await this.prisma.waitlistEntry.update({
      where: { id: entryId },
      data: { status: WaitlistStatus.REMOVED },
    });
    return { ok: true };
  }
}
