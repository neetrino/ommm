import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingChannel,
  BookingStatus,
  ClassSessionStatus,
} from '@prisma/client';
import { PackageUsageService } from '../packages/package-usage.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimePublisherService } from '../realtime/realtime-publisher.service';
import { ScheduleService } from '../schedule/schedule.service';
import { StaffActivityService } from '../staff-activity/staff-activity.service';
import { WaitlistService } from '../waitlist/waitlist.service';
import { BOOKING_INTERACTIVE_TX_TIMEOUT_MS } from './bookings.constants';
import { readGuestPassName } from './bookings-guest-pass.constants';
import type { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsGuestPassService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly waitlist: WaitlistService,
    private readonly schedule: ScheduleService,
    private readonly realtime: RealtimePublisherService,
    private readonly packageUsage: PackageUsageService,
    private readonly staffActivity: StaffActivityService,
  ) {}

  async bookGuest(userId: string, sessionId: string, dto: CreateBookingDto) {
    const guestName = readGuestPassName(dto.guestName);
    if (guestName === null) {
      throw new BadRequestException('Guest name is required');
    }
    if (dto.userPackageId === undefined) {
      throw new BadRequestException('Select a package with a guest pass');
    }
    const session = await this.loadBookableSession(sessionId);
    const booked = await this.waitlist.bookedCount(sessionId);
    if (booked >= session.capacity) {
      throw new BadRequestException('Session is full — join waitlist');
    }
    const booking = await this.persistGuestBooking({
      userId,
      sessionId,
      guestName,
      userPackageId: dto.userPackageId,
      channel: dto.channel ?? BookingChannel.WEBSITE,
      session,
    });
    await this.afterGuestBooked(
      userId,
      sessionId,
      session.capacity,
      booking.id,
    );
    return booking;
  }

  private async loadBookableSession(sessionId: string) {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      include: { classType: { select: { id: true, name: true } } },
    });
    if (
      session === null ||
      session.status === ClassSessionStatus.CANCELLED ||
      session.status === ClassSessionStatus.FINISHED
    ) {
      throw new NotFoundException('Session not found');
    }
    if (session.startsAt < new Date()) {
      throw new BadRequestException('Session already started');
    }
    return session;
  }

  private async persistGuestBooking(params: {
    userId: string;
    sessionId: string;
    guestName: string;
    userPackageId: string;
    channel: BookingChannel;
    session: {
      id: string;
      startsAt: Date;
      classType: { id: string; name: string };
    };
  }) {
    return this.prisma.$transaction(
      async (tx) => {
        const membership =
          await this.packageUsage.getValidatedUserPackageForGuestPass({
            tx,
            userId: params.userId,
            session: {
              id: params.session.id,
              startsAt: params.session.startsAt,
              classType: params.session.classType,
            },
            userPackageId: params.userPackageId,
          });
        const lastGuest = await tx.booking.findFirst({
          where: { userId: params.userId, sessionId: params.sessionId },
          orderBy: { guestPassSlot: 'desc' },
          select: { guestPassSlot: true },
        });
        const guestPassSlot = (lastGuest?.guestPassSlot ?? 0) + 1;
        const saved = await tx.booking.create({
          data: {
            userId: params.userId,
            sessionId: params.sessionId,
            status: BookingStatus.BOOKED,
            channel: params.channel,
            guestName: params.guestName,
            guestPassSlot,
          },
          include: { session: { include: { classType: true } } },
        });
        await this.packageUsage.consumeGuestSlot({
          tx,
          bookingId: saved.id,
          membership,
        });
        return saved;
      },
      { timeout: BOOKING_INTERACTIVE_TX_TIMEOUT_MS },
    );
  }

  private async afterGuestBooked(
    userId: string,
    sessionId: string,
    capacity: number,
    bookingId: string,
  ): Promise<void> {
    const after = await this.waitlist.bookedCount(sessionId);
    if (after >= capacity) {
      await this.prisma.classSession.update({
        where: { id: sessionId },
        data: { status: ClassSessionStatus.FULL },
      });
    }
    await this.schedule.invalidatePublicCache();
    this.realtime.emitBookingSessionChange({ userId, sessionId });
    await this.staffActivity.recordBookingCreated(bookingId);
  }
}
