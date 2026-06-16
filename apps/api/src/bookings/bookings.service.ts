import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BookingStatus,
  BookingChannel,
  type ClassSession,
  ClassSessionStatus,
  ManualPaymentMethod,
  PackageStatus,
  PaymentStatus,
  Prisma,
  Role,
  WaitlistStatus,
  type User,
} from '@prisma/client';
import { BookingCancelIntentService } from '../cache/booking-cancel-intent.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimePublisherService } from '../realtime/realtime-publisher.service';
import { ScheduleService } from '../schedule/schedule.service';
import { PackageUsageService } from '../packages/package-usage.service';
import { resolvePlanAllowedCategories } from '../packages/package-eligibility.util';
import { WaitlistService } from '../waitlist/waitlist.service';
import type { AdminBookingsManagementQueryDto } from './dto/admin-bookings-management-query.dto';
import type { CreateBookingDto } from './dto/create-booking.dto';

/** Neon/pooled DB: booking tx runs several round-trips; Prisma default 5s is too low. */
const BOOKING_INTERACTIVE_TX_TIMEOUT_MS = 15_000;
import type { CreateBookingNoteDto } from './dto/create-booking-note.dto';
import {
  ListMyBookingsQueryDto,
  MyBookingsScope,
} from './dto/list-my-bookings-query.dto';
import type { UpdateAdminBookingDto } from './dto/update-admin-booking.dto';
import {
  isPenalizedCancellation,
  resolveCancellationPenaltyHours,
} from './cancellation-policy';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import {
  BookingManagementOrder,
  SessionListOrder,
} from '../common/enums/list-order.enum';
import {
  resolveBookingSessionOrderBy,
  sortBookingManagementRows,
} from '../common/list-order.helpers';

type ManagementBooking = {
  id: string;
  userId: string;
  sessionId: string;
  userPackageId: string | null;
  status: BookingStatus;
  channel: BookingChannel;
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
    private readonly packageUsage: PackageUsageService,
    private readonly config: ConfigService,
    private readonly cancelIntent: BookingCancelIntentService,
    private readonly schedule: ScheduleService,
    private readonly realtime: RealtimePublisherService,
  ) {}

  async listEligiblePackagesForSession(userId: string, sessionId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: { classType: { select: { id: true, name: true, slug: true } } },
    });
    if (!session || session.status === ClassSessionStatus.CANCELLED) {
      throw new NotFoundException('Session not found');
    }
    if (session.startsAt < new Date()) {
      throw new BadRequestException('Session already started');
    }

    await this.packageUsage.syncExpiredMemberships(userId);

    const covering = await this.packageUsage.listCoveringUserPackages(
      this.prisma,
      userId,
      session.classType,
    );

    return covering.map((pkg) => {
      const usage = this.packageUsage.computeUsageStats(pkg);
      const canBook =
        pkg.plan.isUnlimited || (pkg.sessionsRemaining ?? 0) > 0;
      return {
        userPackageId: pkg.id,
        planId: pkg.planId,
        planName: pkg.plan.name,
        planType: pkg.plan.planType,
        remainingSessions: usage.remainingSessions,
        totalSessions: usage.totalSessions,
        usedSessions: usage.usedSessions,
        isUnlimited: usage.isUnlimited,
        canBook,
        currentPeriodStart: pkg.currentPeriodStart,
        currentPeriodEnd: pkg.currentPeriodEnd,
        includedCategories: resolvePlanAllowedCategories(pkg.plan),
      };
    });
  }

  async book(userId: string, sessionId: string, dto?: CreateBookingDto) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: { classType: { select: { id: true, name: true, slug: true } } },
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

    await this.packageUsage.syncExpiredMemberships(userId);

    const booking = await this.prisma.$transaction(
      async (tx) => {
        const requiredSessions = this.resolveSessionCreditRequirement(session);
        let userPackageId: string | null = null;

        const existingBooking = await tx.booking.findUnique({
          where: { userId_sessionId: { userId, sessionId } },
        });
        if (existingBooking?.status === BookingStatus.BOOKED) {
          throw new BadRequestException('Already booked');
        }

        const canAttachPackage =
          !existingBooking ||
          existingBooking.status === BookingStatus.CANCELLED;

        if (canAttachPackage) {
          userPackageId = await this.resolveBookingPackage(
            tx,
            userId,
            session,
            dto,
            requiredSessions,
          );
        }

        if (existingBooking) {
          return tx.booking.update({
            where: { id: existingBooking.id },
            data: {
              status: BookingStatus.BOOKED,
              channel: dto?.channel ?? BookingChannel.WEBSITE,
              cancelledAt: null,
              attendedAt: null,
              userPackageId,
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
            userPackageId,
          },
          include: { session: { include: { classType: true } } },
        });
      },
      { timeout: BOOKING_INTERACTIVE_TX_TIMEOUT_MS },
    );

    const after = await this.waitlist.bookedCount(sessionId);
    if (after >= session.capacity) {
      await this.prisma.classSession.update({
        where: { id: sessionId },
        data: { status: ClassSessionStatus.FULL },
      });
    }
    await this.schedule.invalidatePublicCache();
    this.realtime.emitBookingSessionChange({
      userId,
      sessionId,
    });
    return booking;
  }

  async registerCancelIntent(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { userId: true, status: true, sessionId: true },
    });
    if (!booking) {
      throw new NotFoundException();
    }
    if (booking.userId !== userId) {
      throw new ForbiddenException();
    }
    if (booking.status !== BookingStatus.BOOKED) {
      throw new BadRequestException('Cannot hold cancel for this booking');
    }
    this.cancelIntent.register(booking.sessionId);
    this.realtime.emitCancelIntentChanged(booking.sessionId);
    return { ok: true };
  }

  async clearCancelIntent(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { userId: true, sessionId: true },
    });
    if (!booking) {
      throw new NotFoundException();
    }
    if (booking.userId !== userId) {
      throw new ForbiddenException();
    }
    this.cancelIntent.clear(booking.sessionId);
    this.realtime.emitCancelIntentChanged(booking.sessionId);
    return { ok: true };
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
    const penaltyHours = resolveCancellationPenaltyHours(
      studio?.cancellationHoursNotice,
    );
    const applyPenalty = isPenalizedCancellation(
      booking.session.startsAt,
      penaltyHours,
    );
    await this.releaseSlot(booking, { applyPenalty });
    this.cancelIntent.clear(booking.sessionId);
    await this.schedule.invalidatePublicCache();
    this.realtime.emitBookingSessionChange({
      userId: booking.userId,
      sessionId: booking.sessionId,
    });
    return { ok: true, penalized: applyPenalty };
  }

  private resolveSessionCreditRequirement(
    session: Pick<ClassSession, 'sessionRequirement' | 'priceCents'>,
  ): number {
    return session.sessionRequirement ?? (session.priceCents > 0 ? 1 : 0);
  }

  private async resolveBookingPackage(
    tx: Prisma.TransactionClient,
    userId: string,
    session: {
      id: string;
      priceCents: number;
      classType: { id: string; name: string; slug: string };
    },
    dto: CreateBookingDto | undefined,
    requiredSessions: number,
  ): Promise<string | null> {
    if (dto?.userPackageId) {
      const selected = await this.packageUsage.getValidatedUserPackageForBooking(
        tx,
        userId,
        dto.userPackageId,
        session.classType,
      );
      await this.packageUsage.consumeSession(tx, selected.id);
      return selected.id;
    }

    if (requiredSessions <= 0) {
      await this.packageUsage.assertCanBookWithoutPackageCredit(
        tx,
        userId,
        session.classType,
      );
      return null;
    }

    const dropInPayment = await tx.payment.findFirst({
      where: {
        userId,
        description: `Drop-in session ${session.id}`,
        status: PaymentStatus.SUCCEEDED,
      },
      select: { id: true },
    });
    if (dropInPayment) {
      return null;
    }

    const eligiblePackages =
      await this.packageUsage.listEligibleUserPackages(
        tx,
        userId,
        session.classType,
      );

    if (eligiblePackages.length === 1) {
      await this.packageUsage.consumeSession(tx, eligiblePackages[0].id);
      return eligiblePackages[0].id;
    }
    if (eligiblePackages.length > 1) {
      throw new BadRequestException(
        'Please choose a package for this booking.',
      );
    }

    if (session.priceCents > 0) {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { giftCreditsCents: true },
      });
      const credits = user?.giftCreditsCents ?? 0;
      if (credits < session.priceCents) {
        throw new BadRequestException(
          'Active package, payment, or gift credits required for this class',
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
          description: `Gift credit spend ${session.id}`,
        },
      });
      return null;
    }

    throw new BadRequestException(
      'Active package or payment required for this class',
    );
  }

  private async releaseSlot(
    booking: {
      id: string;
      userId: string;
      sessionId: string;
      userPackageId: string | null;
      session: Pick<ClassSession, 'priceCents' | 'sessionRequirement'>;
    },
    options: { applyPenalty: boolean } = { applyPenalty: false },
  ) {
    await this.prisma.$transaction(async (tx) => {
      const current = await tx.booking.findUnique({
        where: { id: booking.id },
        select: { status: true, userPackageId: true },
      });
      if (!current || current.status !== BookingStatus.BOOKED) {
        return;
      }
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.CANCELLED, cancelledAt: new Date() },
      });
      const packageId = current.userPackageId ?? booking.userPackageId;
      if (packageId) {
        if (!options.applyPenalty) {
          await this.packageUsage.restoreSession(tx, packageId);
        }
        return;
      }
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
    });
    await this.prisma.classSession.updateMany({
      where: { id: booking.sessionId, status: ClassSessionStatus.FULL },
      data: { status: ClassSessionStatus.ACTIVE },
    });
    await this.waitlist.offerNextIfSlot(booking.sessionId);
  }

  listMine(userId: string, query: ListMyBookingsQueryDto = {}) {
    if (!query.scope) {
      return this.listMineAll(userId);
    }
    if (query.scope === MyBookingsScope.UPCOMING) {
      return this.listMineUpcoming(userId, query.order);
    }
    return this.listMinePast(userId, query);
  }

  private listMineAll(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: this.listMineInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  private listMineUpcoming(userId: string, order?: SessionListOrder) {
    const sessionOrder = resolveBookingSessionOrderBy(order);
    return this.prisma.booking.findMany({
      where: {
        userId,
        status: BookingStatus.BOOKED,
        session: { startsAt: { gt: new Date() } },
      },
      include: this.listMineInclude(),
      orderBy: sessionOrder,
    });
  }

  private async listMinePast(userId: string, query: ListMyBookingsQueryDto) {
    const take = query.take ?? DEFAULT_LIST_PAGE_SIZE;
    const offset = query.offset ?? 0;
    const now = new Date();
    const sessionOrder = resolveBookingSessionOrderBy(query.order);
    const where: Prisma.BookingWhereInput = {
      userId,
      OR: [
        { status: { not: BookingStatus.BOOKED } },
        { session: { startsAt: { lte: now } } },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: this.listMineInclude(),
        orderBy: sessionOrder,
        take,
        skip: offset,
      }),
      this.prisma.booking.count({ where }),
    ]);
    return { rows, total, take, offset };
  }

  private listMineInclude() {
    return {
      session: {
        include: {
          classType: true,
          coach: { include: { user: { select: { name: true } } } },
        },
      },
      userPackage: {
        include: {
          plan: { select: { id: true, name: true, planType: true } },
        },
      },
    } satisfies Prisma.BookingInclude;
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
    await this.schedule.invalidatePublicCache();
    this.realtime.emitBookingSessionChange({
      userId: booking.userId,
      sessionId: booking.sessionId,
    });
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
    await this.schedule.invalidatePublicCache();
    this.realtime.emitBookingSessionChange({
      userId: booking.userId,
      sessionId: targetSessionId,
    });
    if (oldSessionId !== targetSessionId) {
      this.realtime.emitPublicScheduleSession(oldSessionId);
    }
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

    const bookingWhere: Prisma.BookingWhereInput = {
      ...(params.query.status ? { status: params.query.status } : {}),
      ...(params.query.channel ? { channel: params.query.channel } : {}),
      ...(params.query.userId ? { userId: params.query.userId } : {}),
      ...(sessionFilter ? { session: sessionFilter } : {}),
      ...(userSearch ? { user: userSearch } : {}),
    };

    if (params.query.countOnly) {
      const matchedTotal = await this.prisma.booking.count({
        where: bookingWhere,
      });
      return {
        rows: [],
        sessionSlots: [],
        filterOptions: { classTypes: [], coaches: [] },
        summary: {
          total: matchedTotal,
          booked: 0,
          completed: 0,
          cancelled: 0,
          waitlisted: 0,
          today: 0,
        },
        pagination: { total: matchedTotal, take: 0, offset: 0 },
      };
    }

    const adminSessionStatuses: ClassSessionStatus[] = [
      ClassSessionStatus.DRAFT,
      ClassSessionStatus.ACTIVE,
      ClassSessionStatus.FULL,
    ];

    const [bookingsRaw, waitlistsRaw, classTypes, coaches, sessionsRaw] =
      await Promise.all([
        this.prisma.booking.findMany({
          where: bookingWhere,
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
            ...(params.query.userId ? { userId: params.query.userId } : {}),
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
        this.prisma.classSession.findMany({
          where: {
            ...(sessionFilter ?? {}),
            status: { in: adminSessionStatuses },
          },
          include: {
            classType: { select: { id: true, name: true } },
            coach: {
              include: { user: { select: { id: true, name: true } } },
            },
            _count: {
              select: {
                bookings: { where: { status: BookingStatus.BOOKED } },
              },
            },
          },
          orderBy: { startsAt: 'asc' },
          take: 1000,
        }),
      ]);

    const bookings = bookingsRaw as ManagementBooking[];
    const waitlists = waitlistsRaw as ManagementWaitlist[];

    const userIds = Array.from(
      new Set([
        ...bookings.map((row) => row.userId),
        ...waitlists.map((row) => row.user.id),
      ]),
    );
    const [payments, memberships] = userIds.length
      ? await Promise.all([
          this.prisma.payment.findMany({
            where: { userId: { in: userIds } },
            select: {
              id: true,
              userId: true,
              status: true,
              description: true,
              paymentMethod: true,
              userPackageId: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 5000,
          }),
          this.prisma.userPackage.findMany({
            where: {
              userId: { in: userIds },
              status: {
                in: [
                  PackageStatus.ACTIVE,
                  PackageStatus.PENDING,
                  PackageStatus.PAUSED,
                ],
              },
            },
            select: {
              userId: true,
              sessionsRemaining: true,
              plan: {
                select: {
                  name: true,
                  sessionsPerMonth: true,
                  isUnlimited: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          }),
        ])
      : [[], []];

    const paymentByUser = new Map<string, typeof payments>();
    for (const row of payments) {
      const current = paymentByUser.get(row.userId) ?? [];
      current.push(row);
      paymentByUser.set(row.userId, current);
    }
    const membershipByUser = new Map<string, (typeof memberships)[number]>();
    for (const membership of memberships) {
      if (!membershipByUser.has(membership.userId)) {
        membershipByUser.set(membership.userId, membership);
      }
    }

    const bookingRows = bookings.map((booking) => {
      const userPayments = paymentByUser.get(booking.userId) ?? [];
      const paymentStatus = this.resolvePaymentStatus({
        booking,
        payments: userPayments,
      });
      const bookingPaymentMethod = this.resolveBookingPaymentMethod({
        booking,
        payments: userPayments,
      });
      const membership = membershipByUser.get(booking.userId);
      return {
        id: booking.id,
        recordType: 'BOOKING',
        status: booking.status,
        attendanceStatus: this.resolveAttendanceStatus(booking.status),
        paymentStatus,
        bookingPaymentMethod,
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
        package:
          membership === undefined
            ? null
            : {
                planName: membership.plan.name,
                sessionsRemaining: membership.sessionsRemaining,
                sessionsPerMonth: membership.plan.sessionsPerMonth,
                isUnlimited: membership.plan.isUnlimited,
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

    const waitlistRows = waitlists.map((row) => {
      const membership = membershipByUser.get(row.user.id);
      return {
        id: row.id,
        recordType: 'WAITLIST',
        status: 'WAITLISTED',
        attendanceStatus: null,
        paymentStatus: 'UNPAID',
        bookingPaymentMethod: null,
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
        package:
          membership === undefined
            ? null
            : {
                planName: membership.plan.name,
                sessionsRemaining: membership.sessionsRemaining,
                sessionsPerMonth: membership.plan.sessionsPerMonth,
                isUnlimited: membership.plan.isUnlimited,
              },
        latestNote: null,
        waitlistPosition: row.position,
      };
    });

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

    rows = sortBookingManagementRows(
      rows,
      params.query.order ?? BookingManagementOrder.UPCOMING,
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const summary = {
      total: rows.length,
      booked: rows.filter((row) => row.status === BookingStatus.BOOKED).length,
      completed: rows.filter((row) => row.status === BookingStatus.COMPLETED)
        .length,
      cancelled: rows.filter((row) => row.status === BookingStatus.CANCELLED)
        .length,
      waitlisted: rows.filter((row) => row.status === 'WAITLISTED').length,
      today: rows.filter((row) => {
        const starts = new Date(row.session.startsAt);
        return starts >= today && starts < tomorrow;
      }).length,
    };

    const paginate =
      params.query.take !== undefined || params.query.offset !== undefined;
    const take = params.query.take ?? DEFAULT_LIST_PAGE_SIZE;
    const offset = params.query.offset ?? 0;
    const pagedRows = paginate ? rows.slice(offset, offset + take) : rows;

    const sessionSlots = sessionsRaw.map((session) => {
      const bookedCount = session._count.bookings;
      const spotsLeft = Math.max(session.capacity - bookedCount, 0);
      const status =
        session.status === ClassSessionStatus.ACTIVE &&
        bookedCount >= session.capacity
          ? ClassSessionStatus.FULL
          : session.status;
      return {
        id: session.id,
        title: session.title,
        status,
        startsAt: session.startsAt.toISOString(),
        endsAt: session.endsAt.toISOString(),
        capacity: session.capacity,
        bookedCount,
        spotsLeft,
        level: session.level,
        classFormat: session.classFormat,
        classType: {
          id: session.classType.id,
          name: session.classType.name,
        },
        coach: {
          id: session.coach.id,
          name: session.coach.user.name,
        },
      };
    });

    return {
      rows: pagedRows,
      sessionSlots,
      filterOptions: {
        classTypes,
        coaches: coaches.map((coach) => ({
          id: coach.id,
          name: coach.user.name ?? coach.user.id,
        })),
      },
      summary,
      ...(paginate
        ? {
            pagination: {
              total: summary.total,
              take,
              offset,
            },
          }
        : {}),
    };
  }

  async adminGetById(actor: User, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            lastName: true,
            phone: true,
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
      select: {
        status: true,
        description: true,
        paymentMethod: true,
        userPackageId: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return {
      ...booking,
      paymentStatus: this.resolvePaymentStatus({ booking, payments }),
      bookingPaymentMethod: this.resolveBookingPaymentMethod({
        booking,
        payments,
      }),
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
      status: BookingStatus;
    };
    payments: Array<{
      status: PaymentStatus;
      description: string | null;
    }>;
  }) {
    if (params.booking.status === BookingStatus.CANCELLED) {
      return 'CANCELLED';
    }

    const sessionPayment = params.payments.find((payment) =>
      (payment.description ?? '').includes(params.booking.sessionId),
    );
    if (sessionPayment?.status === PaymentStatus.REFUNDED) {
      return 'CANCELLED';
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
    return 'UNPAID';
  }

  private resolveBookingPaymentMethod(params: {
    booking: {
      sessionId: string;
      userPackageId: string | null;
    };
    payments: Array<{
      paymentMethod: ManualPaymentMethod | null;
      description: string | null;
      userPackageId: string | null;
    }>;
  }): ManualPaymentMethod | null {
    const dropInDescription = `Drop-in session ${params.booking.sessionId}`;
    const sessionPayment = params.payments.find(
      (payment) => (payment.description ?? '') === dropInDescription,
    );
    if (sessionPayment?.paymentMethod) {
      return sessionPayment.paymentMethod;
    }

    if (params.booking.userPackageId) {
      const packagePayment = params.payments.find(
        (payment) => payment.userPackageId === params.booking.userPackageId,
      );
      if (packagePayment?.paymentMethod) {
        return packagePayment.paymentMethod;
      }
    }

    return null;
  }
}
