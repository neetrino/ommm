import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  ClassSessionStatus,
  PaymentStatus,
  type ClassSession,
  type Prisma,
} from '@prisma/client';
import { PackageUsageService } from '../packages/package-usage.service';
import { PrismaService } from '../prisma/prisma.service';
import { StaffActivityService } from '../staff-activity/staff-activity.service';
import { WaitlistService } from '../waitlist/waitlist.service';
import { isStaffCancellableBookingStatus } from './bookings-staff-cancel.helpers';

type ReleaseSlotBooking = {
  id: string;
  userId: string;
  sessionId: string;
  session: Pick<ClassSession, 'priceCents' | 'sessionRequirement'>;
};

type ReleaseSlotOptions = {
  applyPenalty: boolean;
  cancelledByUserId?: string;
  /** When false, restore credit but keep the class occupancy unchanged. */
  reopenCapacity?: boolean;
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
    options: ReleaseSlotOptions = { applyPenalty: false },
  ) {
    const previousStatus = await this.prisma.$transaction((tx) =>
      this.cancelBookingInTx(tx, booking, options),
    );
    if (previousStatus === null) {
      return;
    }
    await this.staffActivity.recordBookingCancelled(booking.id);
    const reopenCapacity =
      options.reopenCapacity ?? previousStatus === BookingStatus.BOOKED;
    if (!reopenCapacity) {
      return;
    }
    await this.prisma.classSession.updateMany({
      where: { id: booking.sessionId, status: ClassSessionStatus.FULL },
      data: { status: ClassSessionStatus.ACTIVE },
    });
    await this.waitlist.offerNextIfSlot(booking.sessionId);
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

  private async cancelBookingInTx(
    tx: Prisma.TransactionClient,
    booking: ReleaseSlotBooking,
    options: ReleaseSlotOptions,
  ): Promise<BookingStatus | null> {
    const current = await tx.booking.findUnique({
      where: { id: booking.id },
      select: { status: true, cancelledAt: true },
    });
    if (
      !current ||
      !isStaffCancellableBookingStatus(current.status) ||
      current.cancelledAt != null
    ) {
      return null;
    }
    const reopenCapacity =
      options.reopenCapacity ?? current.status === BookingStatus.BOOKED;
    await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: reopenCapacity ? BookingStatus.CANCELLED : current.status,
        cancelledAt: new Date(),
        ...(options.cancelledByUserId
          ? { cancelledByUserId: options.cancelledByUserId }
          : {}),
      },
    });
    const hasDropInPayment = await tx.payment.findFirst({
      where: {
        userId: booking.userId,
        description: `Drop-in session ${booking.sessionId}`,
        status: PaymentStatus.SUCCEEDED,
      },
      select: { id: true },
    });
    if (!hasDropInPayment && !options.applyPenalty) {
      await this.packageUsage.restoreSession({
        tx,
        bookingId: booking.id,
      });
    }
    return current.status;
  }
}
