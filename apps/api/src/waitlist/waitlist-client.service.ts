import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClassSessionStatus, Role, WaitlistStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimePublisherService } from '../realtime/realtime-publisher.service';
import { WaitlistCapacityService } from './waitlist-capacity.service';
import { WaitlistOffersService } from './waitlist-offers.service';

@Injectable()
export class WaitlistClientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly capacity: WaitlistCapacityService,
    private readonly offers: WaitlistOffersService,
    private readonly realtime: RealtimePublisherService,
  ) {}

  async join(userId: string, sessionId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });
    if (
      !session ||
      session.status === ClassSessionStatus.CANCELLED ||
      session.status === ClassSessionStatus.FINISHED
    ) {
      throw new NotFoundException('Session not found');
    }
    const full = await this.capacity.isFull(sessionId, session.capacity);
    if (!full) {
      throw new BadRequestException('Session is not full');
    }
    const existing = await this.prisma.waitlistEntry.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
    });
    if (
      existing?.status === WaitlistStatus.ACTIVE ||
      existing?.status === WaitlistStatus.OFFERED
    ) {
      throw new BadRequestException('Already on waitlist');
    }
    const last = await this.prisma.waitlistEntry.findFirst({
      where: { sessionId, status: WaitlistStatus.ACTIVE },
      orderBy: { position: 'desc' },
    });
    const position = (last?.position ?? 0) + 1;
    if (existing) {
      const entry = await this.prisma.waitlistEntry.update({
        where: { id: existing.id },
        data: {
          status: WaitlistStatus.ACTIVE,
          position,
          offeredAt: null,
          offerExpiresAt: null,
        },
      });
      this.realtime.emitWaitlistChanged(userId, sessionId);
      return entry;
    }
    const entry = await this.prisma.waitlistEntry.create({
      data: { userId, sessionId, position, status: WaitlistStatus.ACTIVE },
    });
    this.realtime.emitWaitlistChanged(userId, sessionId);
    return entry;
  }

  async leave(userId: string, sessionId: string) {
    const entry = await this.prisma.waitlistEntry.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
      select: { status: true },
    });
    if (
      !entry ||
      (entry.status !== WaitlistStatus.ACTIVE &&
        entry.status !== WaitlistStatus.OFFERED)
    ) {
      throw new NotFoundException('Waitlist entry not found');
    }
    const wasOffered = entry.status === WaitlistStatus.OFFERED;
    await this.prisma.waitlistEntry.updateMany({
      where: {
        userId,
        sessionId,
        status: { in: [WaitlistStatus.ACTIVE, WaitlistStatus.OFFERED] },
      },
      data: { status: WaitlistStatus.REMOVED },
    });
    if (wasOffered) {
      await this.offers.offerNextIfSlot(sessionId);
    }
    this.realtime.emitWaitlistChanged(userId, sessionId);
    return { ok: true };
  }

  listMine(userId: string) {
    return this.prisma.waitlistEntry.findMany({
      where: {
        userId,
        status: { in: [WaitlistStatus.ACTIVE, WaitlistStatus.OFFERED] },
      },
      include: {
        session: {
          include: {
            classType: true,
            coach: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listForSession(sessionId: string, actor?: { id: string; role: Role }) {
    if (actor?.role === Role.COACH) {
      const [profile, session] = await Promise.all([
        this.prisma.coachProfile.findUnique({
          where: { userId: actor.id },
          select: { id: true },
        }),
        this.prisma.classSession.findUnique({
          where: { id: sessionId },
          select: { coachId: true },
        }),
      ]);
      if (!profile || !session || session.coachId !== profile.id) {
        throw new ForbiddenException();
      }
    }
    return this.prisma.waitlistEntry.findMany({
      where: { sessionId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { position: 'asc' },
    });
  }
}
