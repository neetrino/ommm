import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  BookingChannel,
  ClassSessionStatus,
  Prisma,
} from '@prisma/client';
import { BookingCancelIntentService } from '../cache/booking-cancel-intent.service';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import { SessionListOrder } from '../common/enums/list-order.enum';
import { resolveBookingSessionOrderBy } from '../common/list-order.helpers';
import { PackagesService } from '../packages/packages.service';
import { PackageUsageService } from '../packages/package-usage.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimePublisherService } from '../realtime/realtime-publisher.service';
import { ScheduleService } from '../schedule/schedule.service';
import { WaitlistService } from '../waitlist/waitlist.service';
import { BOOKING_INTERACTIVE_TX_TIMEOUT_MS } from './bookings.constants';
import { BookingsSlotService } from './bookings-slot.service';
import {
  isPenalizedCancellation,
  resolveCancellationPenaltyHours,
} from './cancellation-policy';
import type { CreateBookingDto } from './dto/create-booking.dto';
import {
  ListMyBookingsQueryDto,
  MyBookingsScope,
} from './dto/list-my-bookings-query.dto';

@Injectable()
export class BookingsClientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly waitlist: WaitlistService,
    private readonly cancelIntent: BookingCancelIntentService,
    private readonly schedule: ScheduleService,
    private readonly realtime: RealtimePublisherService,
    private readonly packageUsage: PackageUsageService,
    private readonly packages: PackagesService,
    private readonly slots: BookingsSlotService,
  ) {}

  async listEligiblePackagesForSession(userId: string, sessionId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: { classType: { select: { id: true, name: true } } },
    });
    if (!session || session.status === ClassSessionStatus.CANCELLED) {
      throw new NotFoundException('Session not found');
    }
    if (session.startsAt < new Date()) {
      throw new BadRequestException('Session already started');
    }
    return this.packageUsage.listEligibleUserPackages({
      userId,
      session: {
        id: session.id,
        classType: {
          id: session.classType.id,
          name: session.classType.name,
        },
      },
    });
  }

  async listPurchasePlansForSession(sessionId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.status === ClassSessionStatus.CANCELLED) {
      throw new NotFoundException('Session not found');
    }
    if (session.startsAt < new Date()) {
      throw new BadRequestException('Session already started');
    }
    return this.packages.listPlans();
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
    const requiredSessions =
      session.sessionRequirement ?? (session.priceCents > 0 ? 1 : 0);

    const booking = await this.prisma.$transaction(
      async (tx) => {
        const existingBooking = await tx.booking.findUnique({
          where: { userId_sessionId: { userId, sessionId } },
        });
        if (existingBooking?.status === BookingStatus.BOOKED) {
          throw new BadRequestException('Already booked');
        }

        const packageMembership =
          requiredSessions > 0
            ? await this.packageUsage.getValidatedUserPackageForBooking({
                tx,
                userId,
                session: {
                  id: session.id,
                  classType: {
                    id: session.classType.id,
                    name: session.classType.name,
                  },
                },
                userPackageId: dto?.userPackageId,
              })
            : null;

        const savedBooking = existingBooking
          ? await tx.booking.update({
              where: { id: existingBooking.id },
              data: {
                status: BookingStatus.BOOKED,
                channel: dto?.channel ?? BookingChannel.WEBSITE,
                cancelledAt: null,
                attendedAt: null,
              },
              include: { session: { include: { classType: true } } },
            })
          : await tx.booking.create({
              data: {
                userId,
                sessionId,
                status: BookingStatus.BOOKED,
                channel: dto?.channel ?? BookingChannel.WEBSITE,
              },
              include: { session: { include: { classType: true } } },
            });

        if (packageMembership && requiredSessions > 0) {
          await this.packageUsage.consumeSession({
            tx,
            bookingId: savedBooking.id,
            membership: packageMembership,
            sessionCategoryName: session.classType.name,
            requiredSessions,
          });
        }
        return savedBooking;
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
    await this.slots.releaseSlot(booking, { applyPenalty });
    this.cancelIntent.clear(booking.sessionId);
    await this.schedule.invalidatePublicCache();
    this.realtime.emitBookingSessionChange({
      userId: booking.userId,
      sessionId: booking.sessionId,
    });
    return { ok: true, penalized: applyPenalty };
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
    } satisfies Prisma.BookingInclude;
  }
}
