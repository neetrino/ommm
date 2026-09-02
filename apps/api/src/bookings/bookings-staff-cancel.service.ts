import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  UserPackageStatus,
  type User,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimePublisherService } from '../realtime/realtime-publisher.service';
import { ScheduleService } from '../schedule/schedule.service';
import { BookingsSlotService } from './bookings-slot.service';
import {
  isStaffCancellableBookingStatus,
  packagesAllowStaffCancel,
  requiresOpenPackagePeriod,
  STAFF_CANCEL_INVALID_STATUS_MESSAGE,
  STAFF_CANCEL_PACKAGE_EXPIRED_MESSAGE,
} from './bookings-staff-cancel.helpers';

type StaffCancelConsumption = {
  userPackage: {
    currentPeriodEnd: Date;
    status: UserPackageStatus;
  };
};

@Injectable()
export class BookingsStaffCancelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slots: BookingsSlotService,
    private readonly schedule: ScheduleService,
    private readonly realtime: RealtimePublisherService,
  ) {}

  async adminCancel(actor: Pick<User, 'id'>, bookingId: string) {
    const booking = await this.loadBooking(bookingId);
    if (!isStaffCancellableBookingStatus(booking.status)) {
      throw new BadRequestException(STAFF_CANCEL_INVALID_STATUS_MESSAGE);
    }
    this.assertPackagePeriodIfNeeded(booking.status, booking.consumptions);
    await this.slots.releaseSlot(booking, {
      applyPenalty: false,
      cancelledByUserId: actor.id,
    });
    await this.schedule.invalidatePublicCache();
    this.realtime.emitBookingSessionChange({
      userId: booking.userId,
      sessionId: booking.sessionId,
    });
    return { ok: true as const };
  }

  private async loadBooking(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        session: true,
        consumptions: {
          where: { restoredAt: null },
          select: {
            userPackage: {
              select: { currentPeriodEnd: true, status: true },
            },
          },
        },
      },
    });
    if (!booking) {
      throw new NotFoundException();
    }
    return booking;
  }

  private assertPackagePeriodIfNeeded(
    status: BookingStatus,
    consumptions: readonly StaffCancelConsumption[],
  ): void {
    if (!requiresOpenPackagePeriod(status)) {
      return;
    }
    const packs = consumptions.map((row) => row.userPackage);
    if (!packagesAllowStaffCancel(packs, new Date())) {
      throw new BadRequestException(STAFF_CANCEL_PACKAGE_EXPIRED_MESSAGE);
    }
  }
}
