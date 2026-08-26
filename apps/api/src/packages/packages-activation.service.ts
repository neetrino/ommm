import { Injectable } from '@nestjs/common';
import { BookingStatus, UserPackageStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  resolveActivatedPeriodBounds,
  resolveActivationInstant,
} from './packages-activation.helpers';

type AwaitingPackageRow = {
  id: string;
  userId: string;
  createdAt: Date;
  planPeriodDaysSnapshot: number;
};

@Injectable()
export class PackagesActivationService {
  constructor(private readonly prisma: PrismaService) {}

  async reconcileAwaitingPackages(now: Date = new Date()): Promise<number> {
    const awaiting = await this.prisma.userPackage.findMany({
      where: {
        awaitingFirstVisit: true,
        status: UserPackageStatus.ACTIVE,
      },
      select: {
        id: true,
        userId: true,
        createdAt: true,
        planPeriodDaysSnapshot: true,
      },
    });
    let activated = 0;
    for (const row of awaiting) {
      if (await this.reconcileOne(row, now)) {
        activated += 1;
      }
    }
    return activated;
  }

  async activateFromCompletedBooking(bookingId: string): Promise<void> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        status: true,
        userId: true,
        session: { select: { startsAt: true } },
      },
    });
    if (booking === null || booking.status !== BookingStatus.COMPLETED) {
      return;
    }
    const awaiting = await this.prisma.userPackage.findMany({
      where: {
        userId: booking.userId,
        awaitingFirstVisit: true,
        status: UserPackageStatus.ACTIVE,
      },
      select: {
        id: true,
        userId: true,
        createdAt: true,
        planPeriodDaysSnapshot: true,
      },
    });
    const now = new Date();
    for (const row of awaiting) {
      await this.applyActivationIfReady(row, booking.session.startsAt, now);
    }
  }

  private async reconcileOne(
    row: AwaitingPackageRow,
    now: Date,
  ): Promise<boolean> {
    const firstVisitAt = await this.findFirstCompletedVisitAt(row.userId);
    return this.applyActivationIfReady(row, firstVisitAt, now);
  }

  private async applyActivationIfReady(
    row: AwaitingPackageRow,
    firstVisitAt: Date | null,
    now: Date,
  ): Promise<boolean> {
    const activationAt = resolveActivationInstant({
      purchasedAt: row.createdAt,
      firstVisitAt,
      now,
    });
    if (activationAt === null) {
      return false;
    }
    const bounds = resolveActivatedPeriodBounds({
      activationAt,
      periodDays: row.planPeriodDaysSnapshot,
    });
    const updated = await this.prisma.userPackage.updateMany({
      where: {
        id: row.id,
        awaitingFirstVisit: true,
        status: UserPackageStatus.ACTIVE,
      },
      data: {
        awaitingFirstVisit: false,
        currentPeriodStart: bounds.currentPeriodStart,
        currentPeriodEnd: bounds.currentPeriodEnd,
      },
    });
    return updated.count > 0;
  }

  private async findFirstCompletedVisitAt(
    userId: string,
  ): Promise<Date | null> {
    const booking = await this.prisma.booking.findFirst({
      where: { userId, status: BookingStatus.COMPLETED },
      orderBy: { session: { startsAt: 'asc' } },
      select: { session: { select: { startsAt: true } } },
    });
    return booking?.session.startsAt ?? null;
  }
}
