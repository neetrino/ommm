import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  ClassSessionStatus,
  PaymentStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const [
      sessionsToday,
      bookingsToday,
      waitlistCount,
      membersCount,
      revenueAgg,
    ] = await Promise.all([
      this.prisma.classSession.count({
        where: {
          startsAt: { gte: todayStart, lt: todayEnd },
          status: { not: ClassSessionStatus.CANCELLED },
        },
      }),
      this.prisma.booking.count({
        where: {
          status: BookingStatus.BOOKED,
          session: { startsAt: { gte: todayStart, lt: todayEnd } },
        },
      }),
      this.prisma.waitlistEntry.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.userMembership.count({
        where: { status: 'ACTIVE', currentPeriodEnd: { gt: new Date() } },
      }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.SUCCEEDED },
        _sum: { amountCents: true },
      }),
    ]);

    return {
      sessionsToday,
      bookingsToday,
      activeWaitlists: waitlistCount,
      activeMembers: membersCount,
      revenueCentsTotal: revenueAgg._sum.amountCents ?? 0,
    };
  }

  async bookingsCsv(from: Date, to: Date): Promise<string> {
    const rows = await this.prisma.booking.findMany({
      where: {
        session: { startsAt: { gte: from, lte: to } },
      },
      include: {
        user: { select: { email: true, name: true } },
        session: { include: { classType: true } },
      },
      take: 5000,
    });
    const header = 'bookingId,userEmail,userName,class,startsAt,status\n';
    const body = rows
      .map((b) =>
        [
          b.id,
          b.user.email,
          b.user.name ?? '',
          b.session.classType.name,
          b.session.startsAt.toISOString(),
          b.status,
        ]
          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n');
    return header + body;
  }
}
