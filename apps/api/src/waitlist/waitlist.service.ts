import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async remove(entryId: string) {
    await this.prisma.waitlistEntry.update({
      where: { id: entryId },
      data: { status: WaitlistStatus.REMOVED },
    });
    return { ok: true };
  }
}
