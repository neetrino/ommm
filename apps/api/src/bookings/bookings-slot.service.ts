import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  ClassSessionStatus,
  PaymentStatus,
} from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { PackageUsageService } from '../packages/package-usage.service';
import { PrismaService } from '../prisma/prisma.service';
import { StaffActivityService } from '../staff-activity/staff-activity.service';
import { WaitlistService } from '../waitlist/waitlist.service';
import {
  isReleasableBookingStatus,
  RELEASE_SLOT_ERROR,
  shouldOpenSlotAfterRelease,
  type ReleaseSlotSession,
} from './bookings-slot.helpers';

type ReleaseSlotBooking = {
  id: string;
  userId: string;
  sessionId: string;
  session: ReleaseSlotSession;
};

@Injectable()
export class BookingsSlotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly waitlist: WaitlistService,
    private readonly packageUsage: PackageUsageService,
    private readonly staffActivity: StaffActivityService,
  ) {}

  async releaseSlot(
    booking: ReleaseSlotBooking,
    options: { applyPenalty: boolean } = { applyPenalty: false },
  ) {
    const previousStatus = await this.cancelBookingAndRestoreCredits(
      booking,
      options,
    );
    await this.staffActivity.recordBookingCancelled(booking.id);
    if (
      !shouldOpenSlotAfterRelease({
        previousStatus,
        sessionStatus: booking.session.status,
        endsAt: booking.session.endsAt,
      })
    ) {
      return;
    }
    await this.reopenUpcomingSessionSlot(booking.sessionId);
  }

  /**
   * Admin cancelled the class: cancel remaining bookings and restore package
   * sessions without the 24-hour member penalty.
   */
  async releaseRegistrationsForAdminCancelledSession(
    sessionId: string,
  ): Promise<string[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { sessionId },
      include: {
        session: { select: { priceCents: true, sessionRequirement: true } },
      },
    });
    const affectedUserIds: string[] = [];
    for (const booking of bookings) {
      if (booking.status === BookingStatus.BOOKED) {
        await this.releaseSlot(booking, { applyPenalty: false });
        affectedUserIds.push(booking.userId);
        continue;
      }
      if (booking.status !== BookingStatus.CANCELLED) {
        continue;
      }
      await this.prisma.$transaction(async (tx) => {
        await this.packageUsage.restoreSession({
          tx,
          bookingId: booking.id,
        });
      });
      affectedUserIds.push(booking.userId);
    }
    return affectedUserIds;
  }

  private async cancelBookingAndRestoreCredits(
    booking: ReleaseSlotBooking,
    options: { applyPenalty: boolean },
  ): Promise<BookingStatus> {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.booking.findUnique({
        where: { id: booking.id },
        select: { status: true },
      });
      if (current === null) {
        throw new NotFoundException(RELEASE_SLOT_ERROR.NOT_FOUND);
      }
      if (!isReleasableBookingStatus(current.status)) {
        throw new BadRequestException(RELEASE_SLOT_ERROR.NOT_CANCELLABLE);
      }
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.CANCELLED, cancelledAt: new Date() },
      });
      await this.restorePackageIfEligible(tx, booking, options);
      return current.status;
    });
  }

  private async restorePackageIfEligible(
    tx: Prisma.TransactionClient,
    booking: ReleaseSlotBooking,
    options: { applyPenalty: boolean },
  ): Promise<void> {
    const hasDropInPayment = await tx.payment.findFirst({
      where: {
        userId: booking.userId,
        description: `Drop-in session ${booking.sessionId}`,
        status: PaymentStatus.SUCCEEDED,
      },
      select: { id: true },
    });
    if (hasDropInPayment || options.applyPenalty) {
      return;
    }
    await this.packageUsage.restoreSession({
      tx,
      bookingId: booking.id,
    });
  }

  private async reopenUpcomingSessionSlot(sessionId: string): Promise<void> {
    await this.prisma.classSession.updateMany({
      where: { id: sessionId, status: ClassSessionStatus.FULL },
      data: { status: ClassSessionStatus.ACTIVE },
    });
    await this.waitlist.offerNextIfSlot(sessionId);
  }
}
