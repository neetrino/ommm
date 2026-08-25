import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  ClassSessionStatus,
  PaymentStatus,
  type ClassSession,
} from '@prisma/client';
import { PackageUsageService } from '../packages/package-usage.service';
import { PrismaService } from '../prisma/prisma.service';
import { StaffActivityService } from '../staff-activity/staff-activity.service';
import { WaitlistService } from '../waitlist/waitlist.service';

@Injectable()
export class BookingsSlotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly waitlist: WaitlistService,
    private readonly packageUsage: PackageUsageService,
    private readonly staffActivity: StaffActivityService,
  ) {}

  async releaseSlot(
    booking: {
      id: string;
      userId: string;
      sessionId: string;
      session: Pick<ClassSession, 'priceCents' | 'sessionRequirement'>;
    },
    options: { applyPenalty: boolean } = { applyPenalty: false },
  ) {
    let didCancel = false;
    await this.prisma.$transaction(async (tx) => {
      const current = await tx.booking.findUnique({
        where: { id: booking.id },
        select: { status: true },
      });
      if (!current || current.status !== BookingStatus.BOOKED) {
        return;
      }
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.CANCELLED, cancelledAt: new Date() },
      });
      didCancel = true;
      void options.applyPenalty;
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
      if (!options.applyPenalty) {
        await this.packageUsage.restoreSession({
          tx,
          bookingId: booking.id,
        });
      }
    });
    if (didCancel) {
      await this.staffActivity.recordBookingCancelled(booking.id);
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
}
