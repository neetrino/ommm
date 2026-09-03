import { Injectable } from '@nestjs/common';
import { BookingStatus, ClassSessionStatus } from '@prisma/client';
import { PackagesService } from '../packages/packages.service';
import { PackageUsageService } from '../packages/package-usage.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  resolveSessionBookingEligibilityStatus,
  type SessionBookingEligibilityRow,
} from './resolve-session-booking-eligibility';

@Injectable()
export class BookingsSessionEligibilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly packageUsage: PackageUsageService,
    private readonly packages: PackagesService,
  ) {}

  async listForSessions(
    userId: string,
    sessionIds: readonly string[],
  ): Promise<SessionBookingEligibilityRow[]> {
    const uniqueIds = [...new Set(sessionIds)];
    if (uniqueIds.length === 0) {
      return [];
    }

    const now = new Date();
    const sessions = await this.prisma.classSession.findMany({
      where: {
        id: { in: uniqueIds },
        status: { in: [ClassSessionStatus.ACTIVE, ClassSessionStatus.FULL] },
        startsAt: { gt: now },
      },
      select: {
        id: true,
        startsAt: true,
        classTypeId: true,
        classType: { select: { id: true, name: true } },
      },
    });

    if (sessions.length === 0) {
      return [];
    }

    const bookedRows = await this.prisma.booking.findMany({
      where: {
        userId,
        sessionId: { in: sessions.map((session) => session.id) },
        status: BookingStatus.BOOKED,
      },
      select: { sessionId: true },
    });
    const bookedSessionIds = new Set(bookedRows.map((row) => row.sessionId));

    const purchasePlansByClassType = new Map<string, boolean>();
    const results: SessionBookingEligibilityRow[] = [];

    for (const session of sessions) {
      if (bookedSessionIds.has(session.id)) {
        continue;
      }

      const packages = await this.packageUsage.listEligibleUserPackages({
        userId,
        session: {
          id: session.id,
          startsAt: session.startsAt,
          classType: session.classType,
        },
      });

      let hasPurchasePlans = purchasePlansByClassType.get(session.classTypeId);
      if (hasPurchasePlans === undefined) {
        const plans = await this.packages.listPlansCoveringClassType(
          session.classTypeId,
        );
        hasPurchasePlans = plans.length > 0;
        purchasePlansByClassType.set(session.classTypeId, hasPurchasePlans);
      }

      const status = resolveSessionBookingEligibilityStatus({
        packages,
        hasPurchasePlans,
      });
      if (status === null) {
        continue;
      }

      results.push({
        sessionId: session.id,
        status,
        classTypeName: session.classType.name.trim(),
      });
    }

    return results;
  }
}
