import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  BookingStatus,
  ClassSessionStatus,
  Role,
  WaitlistStatus,
} from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { StudioService } from '../studio/studio.service';

@Injectable()
export class WaitlistService {
  private readonly logger = new Logger(WaitlistService.name);
  private readonly waitlistCronEnabled: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly studio: StudioService,
    private readonly audit: AuditService,
  ) {
    this.waitlistCronEnabled = this.isEnabledEnv(
      process.env.ENABLE_WAITLIST_BACKGROUND_JOBS,
    );
  }

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

  async listAdminActive(take: number) {
    const safeTake = Math.min(Math.max(take, 1), 500);
    const activeStatuses = [WaitlistStatus.ACTIVE, WaitlistStatus.OFFERED];
    const entries = await this.prisma.waitlistEntry.findMany({
      where: { status: { in: activeStatuses } },
      orderBy: { createdAt: 'desc' },
      take: safeTake,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        session: {
          select: {
            id: true,
            startsAt: true,
            classType: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
    if (entries.length === 0) {
      return [];
    }
    const sessionIds = [...new Set(entries.map((entry) => entry.sessionId))];
    const counts = await this.prisma.waitlistEntry.groupBy({
      by: ['sessionId'],
      where: {
        sessionId: { in: sessionIds },
        status: { in: activeStatuses },
      },
      _count: {
        _all: true,
      },
    });
    const countBySessionId = new Map(
      counts.map((item) => [item.sessionId, item._count._all]),
    );
    return entries.map((entry) => ({
      id: entry.id,
      status: entry.status,
      waitlistDate: entry.createdAt,
      offeredAt: entry.offeredAt,
      offerExpiresAt: entry.offerExpiresAt,
      sessionWaitlistCount: countBySessionId.get(entry.sessionId) ?? 0,
      user: {
        id: entry.user.id,
        name: entry.user.name,
        lastName: entry.user.lastName,
        email: entry.user.email,
        phone: entry.user.phone,
      },
      session: {
        id: entry.session.id,
        startsAt: entry.session.startsAt,
        classType: {
          id: entry.session.classType.id,
          name: entry.session.classType.name,
        },
      },
    }));
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
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async expireOffersCron(): Promise<void> {
    if (!this.waitlistCronEnabled) {
      return;
    }
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
    this.logger.log(
      `Expired ${stale.length} waitlist offer(s); re-offered where slots remain.`,
    );
  }

  async remove(entryId: string) {
    await this.prisma.waitlistEntry.update({
      where: { id: entryId },
      data: { status: WaitlistStatus.REMOVED },
    });
    return { ok: true };
  }

  async promoteToBooking(entryId: string, targetSessionId: string) {
    const entry = await this.prisma.waitlistEntry.findUnique({
      where: { id: entryId },
      include: { session: true },
    });
    if (!entry) {
      throw new NotFoundException('Waitlist entry not found');
    }
    if (entry.sessionId !== targetSessionId) {
      throw new BadRequestException(
        'targetSessionId does not match entry session',
      );
    }
    if (
      entry.status !== WaitlistStatus.ACTIVE &&
      entry.status !== WaitlistStatus.OFFERED
    ) {
      throw new ConflictException(
        'Only active or offered entries can be promoted',
      );
    }
    const session = entry.session;
    if (!session || session.status === ClassSessionStatus.CANCELLED) {
      throw new NotFoundException('Session not found');
    }
    const booked = await this.bookedCount(session.id);
    if (booked >= session.capacity) {
      throw new ForbiddenException('Session is full');
    }
    const existingBooking = await this.prisma.booking.findUnique({
      where: {
        userId_sessionId: { userId: entry.userId, sessionId: session.id },
      },
    });
    if (existingBooking && existingBooking.status === BookingStatus.BOOKED) {
      throw new ConflictException(
        'User already has an active booking for this session',
      );
    }
    const result = await this.prisma.$transaction(async (tx) => {
      const booking =
        existingBooking == null
          ? await tx.booking.create({
              data: {
                userId: entry.userId,
                sessionId: session.id,
                status: BookingStatus.BOOKED,
              },
            })
          : await tx.booking.update({
              where: { id: existingBooking.id },
              data: {
                status: BookingStatus.BOOKED,
                cancelledAt: null,
                attendedAt: null,
              },
            });
      await tx.waitlistEntry.update({
        where: { id: entry.id },
        data: { status: WaitlistStatus.CONVERTED },
      });
      return booking;
    });
    const after = await this.bookedCount(session.id);
    if (after >= session.capacity) {
      await this.prisma.classSession.updateMany({
        where: { id: session.id, status: ClassSessionStatus.ACTIVE },
        data: { status: ClassSessionStatus.FULL },
      });
    }
    await this.audit.log({
      action: 'WAITLIST_PROMOTED',
      entityType: 'WaitlistEntry',
      entityId: entry.id,
      payload: { bookingId: result.id, sessionId: session.id },
    });
    return result;
  }

  async manualNotify(
    entryId: string,
    payload: {
      subject?: string;
      message?: string;
      actorName?: string | null;
      actorId?: string;
      actorRole?: Role;
    },
  ) {
    const entry = await this.prisma.waitlistEntry.findUnique({
      where: { id: entryId },
      include: {
        user: true,
        session: { include: { classType: true } },
      },
    });
    if (!entry) {
      throw new NotFoundException('Waitlist entry not found');
    }
    const subject =
      payload.subject?.trim() ||
      `Waitlist update: ${entry.session.classType.name}`;
    const actor = payload.actorName?.trim();
    const note = payload.message?.trim();
    const html = [
      `<p>Your waitlist status for <strong>${entry.session.classType.name}</strong> was updated.</p>`,
      note ? `<p>${note}</p>` : '',
      actor ? `<p>Sent by: ${actor}</p>` : '',
    ]
      .filter(Boolean)
      .join('');
    await this.mail.sendEmail({
      to: entry.user.email,
      subject,
      html,
    });
    await this.audit.log({
      actorId: payload.actorId ?? null,
      actorRole: payload.actorRole ?? null,
      action: 'WAITLIST_MANUAL_NOTIFICATION',
      entityType: 'WaitlistEntry',
      entityId: entry.id,
      payload: {
        subject,
      },
    });
    return { ok: true };
  }

  private isEnabledEnv(raw: string | undefined): boolean {
    if (!raw) {
      return false;
    }
    const normalized = raw.trim().toLowerCase();
    return normalized === '1' || normalized === 'true';
  }
}
