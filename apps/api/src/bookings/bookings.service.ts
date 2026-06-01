import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  BookingChannel,
  type ClassSession,
  ClassSessionStatus,
  MembershipStatus,
  PaymentStatus,
  Prisma,
  Role,
  WaitlistStatus,
  type User,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WaitlistService } from '../waitlist/waitlist.service';
import type { AdminBookingsManagementQueryDto } from './dto/admin-bookings-management-query.dto';
import type { CreateBookingDto } from './dto/create-booking.dto';
import type { CreateBookingNoteDto } from './dto/create-booking-note.dto';
import type { UpdateAdminBookingDto } from './dto/update-admin-booking.dto';

type ManagementBooking = {
  id: string;
  userId: string;
  sessionId: string;
  status: BookingStatus;
  channel: BookingChannel;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    memberships: Array<{
      sessionsRemaining: number | null;
      plan: {
        name: string;
        sessionsPerMonth: number | null;
        isUnlimited: boolean;
      };
    }>;
  };
  session: {
    id: string;
    startsAt: Date;
    endsAt: Date;
    classType: { id: string; name: string };
    coach: { id: string; user: { name: string | null } };
  };
  notes: Array<{
    id: string;
    body: string;
    createdAt: Date;
    author: { name: string | null };
  }>;
};

type ManagementWaitlist = {
  id: string;
  position: number;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
  session: {
    id: string;
    startsAt: Date;
    endsAt: Date;
    classType: { id: string; name: string };
    coach: { id: string; user: { name: string | null } };
  };
};

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly waitlist: WaitlistService,
  ) {}

  async book(userId: string, sessionId: string, dto?: CreateBookingDto) {
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
              throw new BadRequestException(
                'No sessions remaining on your plan',
              );
            }
            await tx.userMembership.update({
              where: { id: m.id },
              data: {
                sessionsRemaining: m.sessionsRemaining - requiredSessions,
              },
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
            channel: dto?.channel ?? BookingChannel.WEBSITE,
            cancelledAt: null,
            attendedAt: null,
          },
          include: { session: { include: { classType: true } } },
        });
      }
      return tx.booking.create({
        data: {
          userId,
          sessionId,
          status: BookingStatus.BOOKED,
          channel: dto?.channel ?? BookingChannel.WEBSITE,
        },
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
        booking.session.sessionRequirement ??
        (booking.session.priceCents > 0 ? 1 : 0);
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
      if (
        !membership ||
        membership.plan.isUnlimited ||
        membership.sessionsRemaining == null
      ) {
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
        ? ({
            coach: { userId: filters.actor.id },
          } as Prisma.ClassSessionWhereInput)
        : undefined;
    const sessionFilter: Prisma.ClassSessionWhereInput | undefined =
      filters.from && filters.to
        ? {
            startsAt: { gte: filters.from, lte: filters.to },
            ...(coachScope ?? {}),
          }
        : coachScope;
    return this.prisma.booking.findMany({
      where: {
        ...(filters.sessionId && { sessionId: filters.sessionId }),
        ...(filters.userId && { userId: filters.userId }),
        ...(sessionFilter && { session: sessionFilter }),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        session: {
          include: {
            classType: true,
            coach: { include: { user: { select: { id: true, name: true } } } },
          },
        },
        notes: { include: { author: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async listAdminManagement(params: {
    actor: User;
    query: AdminBookingsManagementQueryDto;
  }) {
    const sessionFilter = this.buildScopedSessionFilter({
      actor: params.actor,
      from: params.query.from,
      to: params.query.to,
      classTypeId: params.query.classTypeId,
      coachId: params.query.coachId,
    });
    const q = params.query.q?.trim();
    const userSearch: Prisma.UserWhereInput | undefined =
      q && q.length > 0
        ? {
            OR: [
              { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
              { email: { contains: q, mode: Prisma.QueryMode.insensitive } },
              { phone: { contains: q, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : undefined;

    const [bookingsRaw, waitlistsRaw, classTypes, coaches] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          ...(params.query.status ? { status: params.query.status } : {}),
          ...(params.query.channel ? { channel: params.query.channel } : {}),
          ...(sessionFilter ? { session: sessionFilter } : {}),
          ...(userSearch ? { user: userSearch } : {}),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              memberships: {
                where: {
                  status: MembershipStatus.ACTIVE,
                  currentPeriodEnd: { gt: new Date() },
                },
                take: 1,
                include: { plan: true },
              },
            },
          },
          session: {
            include: {
              classType: true,
              coach: {
                include: { user: { select: { id: true, name: true } } },
              },
            },
          },
          notes: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { author: { select: { id: true, name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 1000,
      }),
      this.prisma.waitlistEntry.findMany({
        where: {
          status: { in: [WaitlistStatus.ACTIVE, WaitlistStatus.OFFERED] },
          ...(sessionFilter ? { session: sessionFilter } : {}),
          ...(userSearch ? { user: userSearch } : {}),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          session: {
            include: {
              classType: true,
              coach: {
                include: { user: { select: { id: true, name: true } } },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
      this.prisma.classType.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.coachProfile.findMany({
        select: { id: true, user: { select: { id: true, name: true } } },
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const bookings = bookingsRaw as ManagementBooking[];
    const waitlists = waitlistsRaw as ManagementWaitlist[];

    const userIds = Array.from(new Set(bookings.map((row) => row.userId)));
    const payments = userIds.length
      ? await this.prisma.payment.findMany({
          where: { userId: { in: userIds } },
          select: {
            id: true,
            userId: true,
            status: true,
            description: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5000,
        })
      : [];

    const paymentByUser = new Map<string, typeof payments>();
    for (const row of payments) {
      const current = paymentByUser.get(row.userId) ?? [];
      current.push(row);
      paymentByUser.set(row.userId, current);
    }

    const bookingRows = bookings.map((booking) => {
      const paymentStatus = this.resolvePaymentStatus({
        booking,
        payments: paymentByUser.get(booking.userId) ?? [],
      });
      return {
        id: booking.id,
        recordType: 'BOOKING',
        status: booking.status,
        attendanceStatus: this.resolveAttendanceStatus(booking.status),
        paymentStatus,
        channel: booking.channel,
        registerDate: booking.createdAt.toISOString(),
        user: {
          id: booking.user.id,
          name: booking.user.name,
          email: booking.user.email,
          phone: booking.user.phone,
        },
        session: {
          id: booking.session.id,
          startsAt: booking.session.startsAt.toISOString(),
          endsAt: booking.session.endsAt.toISOString(),
          classType: {
            id: booking.session.classType.id,
            name: booking.session.classType.name,
          },
          coach: {
            id: booking.session.coach.id,
            name: booking.session.coach.user.name,
          },
        },
        membership:
          booking.user.memberships[0] === undefined
            ? null
            : {
                planName: booking.user.memberships[0].plan.name,
                sessionsRemaining:
                  booking.user.memberships[0].sessionsRemaining,
                sessionsPerMonth:
                  booking.user.memberships[0].plan.sessionsPerMonth,
                isUnlimited: booking.user.memberships[0].plan.isUnlimited,
              },
        latestNote:
          booking.notes[0] === undefined
            ? null
            : {
                id: booking.notes[0].id,
                body: booking.notes[0].body,
                authorName: booking.notes[0].author.name,
                createdAt: booking.notes[0].createdAt.toISOString(),
              },
      };
    });

    const waitlistRows = waitlists.map((row) => ({
      id: row.id,
      recordType: 'WAITLIST',
      status: 'WAITLISTED',
      attendanceStatus: null,
      paymentStatus: 'UNPAID',
      channel: 'WEBSITE',
      registerDate: row.createdAt.toISOString(),
      user: {
        id: row.user.id,
        name: row.user.name,
        email: row.user.email,
        phone: row.user.phone,
      },
      session: {
        id: row.session.id,
        startsAt: row.session.startsAt.toISOString(),
        endsAt: row.session.endsAt.toISOString(),
        classType: {
          id: row.session.classType.id,
          name: row.session.classType.name,
        },
        coach: {
          id: row.session.coach.id,
          name: row.session.coach.user.name,
        },
      },
      membership: null,
      latestNote: null,
      waitlistPosition: row.position,
    }));

    let rows = [...bookingRows, ...waitlistRows];
    if (params.query.paymentStatus) {
      rows = rows.filter(
        (row) =>
          row.paymentStatus.toUpperCase() ===
          params.query.paymentStatus?.toUpperCase(),
      );
    }
    if (params.query.attendanceStatus) {
      rows = rows.filter(
        (row) =>
          (row.attendanceStatus ?? '').toUpperCase() ===
          params.query.attendanceStatus?.toUpperCase(),
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      rows,
      filterOptions: {
        classTypes,
        coaches: coaches.map((coach) => ({
          id: coach.id,
          name: coach.user.name ?? coach.user.id,
        })),
      },
      summary: {
        total: rows.length,
        booked: rows.filter((row) => row.status === BookingStatus.BOOKED)
          .length,
        completed: rows.filter((row) => row.status === BookingStatus.COMPLETED)
          .length,
        cancelled: rows.filter((row) => row.status === BookingStatus.CANCELLED)
          .length,
        waitlisted: rows.filter((row) => row.status === 'WAITLISTED').length,
        today: rows.filter((row) => {
          const starts = new Date(row.session.startsAt);
          return starts >= today && starts < tomorrow;
        }).length,
      },
    };
  }

  async adminGetById(actor: User, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          include: {
            memberships: {
              include: { plan: true },
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        },
        session: {
          include: {
            classType: true,
            coach: { include: { user: { select: { id: true, name: true } } } },
          },
        },
        notes: {
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
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
    const payments = await this.prisma.payment.findMany({
      where: { userId: booking.userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return {
      ...booking,
      paymentStatus: this.resolvePaymentStatus({ booking, payments }),
      attendanceStatus: this.resolveAttendanceStatus(booking.status),
    };
  }

  async adminUpdate(bookingId: string, dto: UpdateAdminBookingDto) {
    if (dto.targetSessionId && dto.targetSessionId.trim() !== '') {
      await this.moveBooking(bookingId, dto.targetSessionId);
    }
    if (dto.status === BookingStatus.CANCELLED) {
      await this.adminCancel(bookingId);
      return this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: { session: { include: { classType: true } } },
      });
    }
    if (dto.attended !== undefined && dto.status === undefined) {
      return this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: dto.attended ? BookingStatus.COMPLETED : BookingStatus.MISSED,
          attendedAt: dto.attended ? new Date() : null,
        },
      });
    }
    if (dto.status === undefined) {
      throw new BadRequestException('No updatable fields were provided');
    }
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: dto.status,
        cancelledAt: null,
        attendedAt: dto.status === BookingStatus.COMPLETED ? new Date() : null,
      },
    });
  }

  async adminDeletePermanent(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, status: true },
    });
    if (!booking) {
      throw new NotFoundException();
    }
    if (booking.status === BookingStatus.BOOKED) {
      throw new BadRequestException(
        'Active bookings cannot be deleted permanently. Cancel first.',
      );
    }
    await this.prisma.booking.delete({ where: { id: bookingId } });
    return { ok: true };
  }

  private buildScopedSessionFilter(params: {
    actor: User;
    from?: string;
    to?: string;
    classTypeId?: string;
    coachId?: string;
  }): Prisma.ClassSessionWhereInput | undefined {
    const coachScope =
      params.actor.role === Role.COACH
        ? ({
            coach: { userId: params.actor.id },
          } as Prisma.ClassSessionWhereInput)
        : undefined;
    const startsAt =
      params.from || params.to
        ? {
            ...(params.from ? { gte: new Date(params.from) } : {}),
            ...(params.to ? { lte: new Date(params.to) } : {}),
          }
        : undefined;

    const filter: Prisma.ClassSessionWhereInput = {
      ...(startsAt ? { startsAt } : {}),
      ...(params.classTypeId ? { classTypeId: params.classTypeId } : {}),
      ...(params.coachId ? { coachId: params.coachId } : {}),
      ...(coachScope ?? {}),
    };
    return Object.keys(filter).length > 0 ? filter : undefined;
  }

  private resolveAttendanceStatus(status: BookingStatus) {
    if (status === BookingStatus.COMPLETED) {
      return 'ATTENDED';
    }
    if (status === BookingStatus.MISSED) {
      return 'NO_SHOW';
    }
    if (status === BookingStatus.CANCELLED) {
      return 'NOT_ATTENDED';
    }
    return 'NOT_ATTENDED';
  }

  private resolvePaymentStatus(params: {
    booking: {
      sessionId: string;
      user: { memberships?: Array<unknown> };
      status: BookingStatus;
    };
    payments: Array<{
      status: PaymentStatus;
      description: string | null;
    }>;
  }) {
    const sessionPayment = params.payments.find((payment) =>
      (payment.description ?? '').includes(params.booking.sessionId),
    );
    if (sessionPayment?.status === PaymentStatus.REFUNDED) {
      return 'REFUNDED';
    }
    if (
      sessionPayment?.status === PaymentStatus.SUCCEEDED &&
      /cash/i.test(sessionPayment.description ?? '')
    ) {
      return 'CASH';
    }
    if (sessionPayment?.status === PaymentStatus.SUCCEEDED) {
      return 'PAID';
    }
    if ((params.booking.user.memberships?.length ?? 0) > 0) {
      return 'PAID';
    }
    if (params.booking.status === BookingStatus.CANCELLED) {
      return 'UNPAID';
    }
    return 'UNPAID';
  }
}
