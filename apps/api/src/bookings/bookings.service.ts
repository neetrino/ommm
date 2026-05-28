import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  type ClassSession,
  ClassSessionStatus,
  MembershipStatus,
  PaymentStatus,
  Prisma,
  Role,
  type User,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WaitlistService } from '../waitlist/waitlist.service';
import type { CreateBookingNoteDto } from './dto/create-booking-note.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly waitlist: WaitlistService,
  ) {}

  async book(userId: string, sessionId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.status === ClassSessionStatus.CANCELLED) {
      throw new NotFoundException('Session not found');
    }
    if (session.startsAt < new Date()) {
      throw new BadRequestException('Session already started');
    }
    const existing = await this.prisma.booking.findUnique({
      where: { userId_sessionId: { userId, sessionId } },
    });
    if (existing?.status === BookingStatus.BOOKED) {
      throw new BadRequestException('Already booked');
    }
    const booked = await this.waitlist.bookedCount(sessionId);
    if (booked >= session.capacity) {
      throw new BadRequestException('Session is full — join waitlist');
    }

    const booking = await this.prisma.$transaction(async (tx) => {
      const requiredSessions =
        session.sessionRequirement ?? (session.priceCents > 0 ? 1 : 0);
      if (requiredSessions > 0) {
        const m = await tx.userMembership.findFirst({
          where: {
            userId,
            status: MembershipStatus.ACTIVE,
            currentPeriodEnd: { gt: new Date() },
          },
          include: { plan: true },
        });
        if (m) {
          if (!m.plan.isUnlimited) {
            if (
              m.sessionsRemaining == null ||
              m.sessionsRemaining < requiredSessions
            ) {
              throw new BadRequestException('No sessions remaining on your plan');
            }
            await tx.userMembership.update({
              where: { id: m.id },
              data: { sessionsRemaining: m.sessionsRemaining - requiredSessions },
            });
          }
        } else if (session.priceCents > 0) {
          const user = await tx.user.findUnique({
            where: { id: userId },
            select: { giftCreditsCents: true },
          });
          const credits = user?.giftCreditsCents ?? 0;
          if (credits < session.priceCents) {
            throw new BadRequestException(
              'Active membership, payment, or gift credits required for this class',
            );
          }
          await tx.user.update({
            where: { id: userId },
            data: { giftCreditsCents: { decrement: session.priceCents } },
          });
          await tx.payment.create({
            data: {
              userId,
              amountCents: session.priceCents,
              status: PaymentStatus.SUCCEEDED,
              description: `Gift credit spend ${sessionId}`,
            },
          });
        } else {
          throw new BadRequestException(
            'Active membership or payment required for this class',
          );
        }
      }
      const existingBooking = await tx.booking.findUnique({
        where: { userId_sessionId: { userId, sessionId } },
      });
      if (existingBooking) {
        return tx.booking.update({
          where: { id: existingBooking.id },
          data: {
            status: BookingStatus.BOOKED,
            cancelledAt: null,
            attendedAt: null,
          },
          include: { session: { include: { classType: true } } },
        });
      }
      return tx.booking.create({
        data: { userId, sessionId, status: BookingStatus.BOOKED },
        include: { session: { include: { classType: true } } },
      });
    });

    const after = await this.waitlist.bookedCount(sessionId);
    if (after >= session.capacity) {
      await this.prisma.classSession.update({
        where: { id: sessionId },
        data: { status: ClassSessionStatus.FULL },
      });
    }
    return booking;
  }

  async cancel(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { session: true },
    });
    if (!booking) {
      throw new NotFoundException();
    }
    if (booking.userId !== userId) {
      throw new ForbiddenException();
    }
    if (booking.status !== BookingStatus.BOOKED) {
      throw new BadRequestException('Cannot cancel this booking');
    }
    const studio = await this.prisma.studioSettings.findFirst();
    const noticeHours = studio?.cancellationHoursNotice ?? 24;
    const deadline = new Date(booking.session.startsAt);
    deadline.setHours(deadline.getHours() - noticeHours);
    if (new Date() > deadline) {
      throw new BadRequestException(
        `Cancellation must be at least ${noticeHours}h before class`,
      );
    }
    await this.releaseSlot(booking);
    return { ok: true };
  }

  private async releaseSlot(booking: {
    id: string;
    userId: string;
    sessionId: string;
    session: Pick<ClassSession, 'priceCents' | 'sessionRequirement'>;
  }) {
    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.CANCELLED, cancelledAt: new Date() },
      });
      const requiredSessions =
        booking.session.sessionRequirement ?? (booking.session.priceCents > 0 ? 1 : 0);
      if (requiredSessions <= 0) {
        return;
      }
      const hasDropInPayment = await tx.payment.findFirst({
        where: {
          userId: booking.userId,
          description: `Drop-in session ${booking.sessionId}`,
          status: PaymentStatus.SUCCEEDED,
        },
        select: { id: true },
      });
      if (hasDropInPayment) {
        return;
      }
      const membership = await tx.userMembership.findFirst({
        where: {
          userId: booking.userId,
          status: MembershipStatus.ACTIVE,
          currentPeriodEnd: { gt: new Date() },
        },
        include: { plan: true },
      });
      if (!membership || membership.plan.isUnlimited || membership.sessionsRemaining == null) {
        return;
      }
      const maxSessions = membership.plan.sessionsPerMonth;
      const restored = membership.sessionsRemaining + requiredSessions;
      await tx.userMembership.update({
        where: { id: membership.id },
        data: {
          sessionsRemaining:
            maxSessions == null ? restored : Math.min(restored, maxSessions),
        },
      });
    });
    await this.prisma.classSession.updateMany({
      where: { id: booking.sessionId, status: ClassSessionStatus.FULL },
      data: { status: ClassSessionStatus.ACTIVE },
    });
    await this.waitlist.offerNextIfSlot(booking.sessionId);
  }

  listMine(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
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

  async adminCancel(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { session: true },
    });
    if (!booking) {
      throw new NotFoundException();
    }
    await this.releaseSlot(booking);
    return { ok: true };
  }

  async moveBooking(bookingId: string, targetSessionId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking || booking.status !== BookingStatus.BOOKED) {
      throw new BadRequestException('Invalid booking');
    }
    const target = await this.prisma.classSession.findUnique({
      where: { id: targetSessionId },
    });
    if (!target || target.status === ClassSessionStatus.CANCELLED) {
      throw new NotFoundException('Target session not found');
    }
    const n = await this.waitlist.bookedCount(targetSessionId);
    if (n >= target.capacity) {
      throw new BadRequestException('Target session is full');
    }
    const oldSessionId = booking.sessionId;
    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { sessionId: targetSessionId },
      include: { session: true },
    });
    await this.prisma.classSession.updateMany({
      where: { id: oldSessionId, status: ClassSessionStatus.FULL },
      data: { status: ClassSessionStatus.ACTIVE },
    });
    const oldSession = await this.prisma.classSession.findUnique({
      where: { id: oldSessionId },
    });
    if (oldSession) {
      const oldBooked = await this.waitlist.bookedCount(oldSessionId);
      if (oldBooked < oldSession.capacity) {
        await this.prisma.classSession.update({
          where: { id: oldSessionId },
          data: { status: ClassSessionStatus.ACTIVE },
        });
      }
    }
    const newBooked = await this.waitlist.bookedCount(targetSessionId);
    if (newBooked >= target.capacity) {
      await this.prisma.classSession.update({
        where: { id: targetSessionId },
        data: { status: ClassSessionStatus.FULL },
      });
    }
    await this.waitlist.offerNextIfSlot(oldSessionId);
    return updated;
  }

  async markAttended(actor: User, bookingId: string, attended: boolean) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { session: { select: { coachId: true } } },
    });
    if (!booking) {
      throw new NotFoundException();
    }
    if (actor.role === Role.COACH) {
      const profile = await this.prisma.coachProfile.findUnique({
        where: { userId: actor.id },
        select: { id: true },
      });
      if (!profile || booking.session.coachId !== profile.id) {
        throw new ForbiddenException();
      }
    }
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: attended ? BookingStatus.COMPLETED : BookingStatus.MISSED,
        attendedAt: attended ? new Date() : null,
      },
    });
  }

  async addNote(author: User, bookingId: string, dto: CreateBookingNoteDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { session: true },
    });
    if (!booking) {
      throw new NotFoundException();
    }
    if (author.role === Role.COACH) {
      const profile = await this.prisma.coachProfile.findUnique({
        where: { userId: author.id },
      });
      if (!profile || booking.session.coachId !== profile.id) {
        throw new ForbiddenException();
      }
    }
    return this.prisma.bookingNote.create({
      data: {
        bookingId,
        authorId: author.id,
        body: dto.body,
      },
    });
  }

  listAdmin(filters: {
    actor: User;
    sessionId?: string;
    userId?: string;
    from?: Date;
    to?: Date;
  }) {
    const coachScope =
      filters.actor.role === Role.COACH
        ? ({ coach: { userId: filters.actor.id } } as Prisma.ClassSessionWhereInput)
        : undefined;
    const sessionFilter: Prisma.ClassSessionWhereInput | undefined =
      filters.from && filters.to
        ? { startsAt: { gte: filters.from, lte: filters.to }, ...(coachScope ?? {}) }
        : coachScope;
    return this.prisma.booking.findMany({
      where: {
        ...(filters.sessionId && { sessionId: filters.sessionId }),
        ...(filters.userId && { userId: filters.userId }),
        ...(sessionFilter && { session: sessionFilter }),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        session: { include: { classType: true } },
        notes: { include: { author: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
