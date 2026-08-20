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
} from '@prisma/client';
import { BookingCancelIntentService } from '../cache/booking-cancel-intent.service';
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
import { BookingsClientListService } from './bookings-client-list.service';
import {
  resolveBookingSessionCredits,
  shouldValidatePackageForBooking,
} from './resolve-booking-session-credits';
import type { CreateBookingDto } from './dto/create-booking.dto';
import type { ListMyBookingsQueryDto } from './dto/list-my-bookings-query.dto';

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
    private readonly clientList: BookingsClientListService,
  ) {}

  async listEligiblePackagesForSession(userId: string, sessionId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: { classType: { select: { id: true, name: true } } },
    });
    if (
      !session ||
      session.status === ClassSessionStatus.CANCELLED ||
      session.status === ClassSessionStatus.FINISHED
    ) {
      throw new NotFoundException('Session not found');
    }
    if (session.startsAt < new Date()) {
      throw new BadRequestException('Session already started');
    }
    return this.packageUsage.listEligibleUserPackages({
      userId,
      session: {
        id: session.id,
        startsAt: session.startsAt,
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
      select: {
        id: true,
        status: true,
        startsAt: true,
        classTypeId: true,
      },
    });
    if (
      !session ||
      session.status === ClassSessionStatus.CANCELLED ||
      session.status === ClassSessionStatus.FINISHED
    ) {
      throw new NotFoundException('Session not found');
    }
    if (session.startsAt < new Date()) {
      throw new BadRequestException('Session already started');
    }
    return this.packages.listPlansCoveringClassType(session.classTypeId);
  }

  async book(userId: string, sessionId: string, dto?: CreateBookingDto) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: { classType: { select: { id: true, name: true, slug: true } } },
    });
    if (
      !session ||
      session.status === ClassSessionStatus.CANCELLED ||
      session.status === ClassSessionStatus.FINISHED
    ) {
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
    const requiredSessions = resolveBookingSessionCredits({
      session,
      userPackageId: dto?.userPackageId,
    });
    const usePackageCredit = shouldValidatePackageForBooking({
      session,
      userPackageId: dto?.userPackageId,
    });

    const booking = await this.prisma.$transaction(
      async (tx) => {
        const existingBooking = await tx.booking.findUnique({
          where: { userId_sessionId: { userId, sessionId } },
        });
        if (existingBooking?.status === BookingStatus.BOOKED) {
          throw new BadRequestException('Already booked');
        }

        const packageMembership = usePackageCredit
          ? await this.packageUsage.getValidatedUserPackageForBooking({
              tx,
              userId,
              session: {
                id: session.id,
                startsAt: session.startsAt,
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
            sessionClassType: {
              id: session.classType.id,
              name: session.classType.name,
            },
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
    return this.clientList.listMine(userId, query);
  }
}
