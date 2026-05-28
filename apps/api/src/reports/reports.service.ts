import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  ClassSessionStatus,
  GiftCardStatus,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DateRangeQueryDto } from './dto/date-range-query.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(options?: { includeRevenue?: boolean }) {
    const includeRevenue = options?.includeRevenue === true;
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
      includeRevenue
        ? this.prisma.payment.aggregate({
            where: { status: PaymentStatus.SUCCEEDED },
            _sum: { amountCents: true },
          })
        : Promise.resolve(null),
    ]);

    return {
      sessionsToday,
      bookingsToday,
      activeWaitlists: waitlistCount,
      activeMembers: membersCount,
      ...(includeRevenue && {
        revenueCentsTotal: revenueAgg?._sum.amountCents ?? 0,
      }),
    };
  }

  async bookingsCsv(from: Date, to: Date): Promise<string> {
    const toSafe = new Date(to);
    const fromSafe = new Date(from);
    if (toSafe < fromSafe) {
      throw new Error('Invalid range');
    }
    const rows = await this.prisma.booking.findMany({
      where: {
        session: { startsAt: { gte: fromSafe, lte: toSafe } },
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

  async financeSummary(range: DateRangeQueryDto) {
    const dateFilter = this.buildPaymentDateFilter(range);
    const where: Prisma.PaymentWhereInput = {
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    };
    const [totals, byStatusRaw, payments, giftIssuedAgg, giftRedeemedAgg, giftSpentAgg, giftLiabilityAgg] =
      await Promise.all([
      this.prisma.payment.aggregate({
        where: { ...where, status: PaymentStatus.SUCCEEDED },
        _sum: { amountCents: true },
        _count: { id: true },
      }),
      this.prisma.payment.groupBy({
        by: ['status'],
        where,
        _sum: { amountCents: true },
        _count: { id: true },
      }),
      this.prisma.payment.findMany({
        where,
        select: {
          id: true,
          amountCents: true,
          description: true,
          status: true,
        },
      }),
      this.prisma.giftCard.aggregate({
        where: {
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
        _sum: { amountCents: true },
        _count: { id: true },
      }),
      this.prisma.giftCard.aggregate({
        where: {
          status: GiftCardStatus.REDEEMED,
          ...(dateFilter ? { updatedAt: dateFilter } : {}),
        },
        _sum: { amountCents: true },
        _count: { id: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          ...where,
          status: PaymentStatus.SUCCEEDED,
          description: { startsWith: 'Gift credit spend' },
        },
        _sum: { amountCents: true },
        _count: { id: true },
      }),
      this.prisma.user.aggregate({
        _sum: { giftCreditsCents: true },
      }),
    ]);

    const bySource = payments.reduce<
      Record<
        'membership' | 'dropin' | 'gift' | 'other',
        { count: number; amountCents: number }
      >
    >(
      (acc, payment) => {
        const source = this.detectPaymentSource(payment.description);
        acc[source].count += 1;
        if (payment.status === PaymentStatus.SUCCEEDED) {
          acc[source].amountCents += payment.amountCents;
        }
        return acc;
      },
      {
        membership: { count: 0, amountCents: 0 },
        dropin: { count: 0, amountCents: 0 },
        gift: { count: 0, amountCents: 0 },
        other: { count: 0, amountCents: 0 },
      },
    );

    const byStatus = byStatusRaw.map((entry) => ({
      status: entry.status,
      count: entry._count.id,
      amountCents: entry._sum.amountCents ?? 0,
    }));

    const averageOrderValueCents =
      (totals._count.id ?? 0) > 0
        ? Math.round((totals._sum.amountCents ?? 0) / (totals._count.id ?? 1))
        : 0;

    return {
      range: this.resolveRange(range),
      totals: {
        revenueCents: totals._sum.amountCents ?? 0,
        successfulPaymentsCount: totals._count.id ?? 0,
        averageOrderValueCents,
      },
      byStatus,
      bySource,
      giftCredits: {
        issuedCents: giftIssuedAgg._sum.amountCents ?? 0,
        issuedCount: giftIssuedAgg._count.id ?? 0,
        redeemedCents: giftRedeemedAgg._sum.amountCents ?? 0,
        redeemedCount: giftRedeemedAgg._count.id ?? 0,
        spentCents: giftSpentAgg._sum.amountCents ?? 0,
        spendTransactionsCount: giftSpentAgg._count.id ?? 0,
        outstandingCreditsCents: giftLiabilityAgg._sum.giftCreditsCents ?? 0,
      },
    };
  }

  async paymentsCsv(range: DateRangeQueryDto): Promise<string> {
    const dateFilter = this.buildPaymentDateFilter(range);
    const rows = await this.prisma.payment.findMany({
      where: {
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      include: {
        user: { select: { id: true, email: true, name: true, lastName: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 10_000,
    });

    const header =
      'paymentId,createdAt,userId,userEmail,userName,amountCents,currency,status,source,description\n';
    const body = rows
      .map((payment) =>
        [
          payment.id,
          payment.createdAt.toISOString(),
          payment.userId,
          payment.user.email,
          `${payment.user.name ?? ''} ${payment.user.lastName ?? ''}`.trim(),
          payment.amountCents,
          payment.currency,
          payment.status,
          this.detectPaymentSource(payment.description),
          payment.description ?? '',
        ]
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n');
    return header + body;
  }

  async coachAnalytics(userId: string, days: number) {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      return null;
    }
    const range = this.resolveRelativeDays(days);
    const sessions = await this.prisma.classSession.findMany({
      where: {
        coachId: profile.id,
        startsAt: { gte: range.from, lte: range.to },
        status: { not: ClassSessionStatus.CANCELLED },
      },
      select: { id: true, capacity: true, startsAt: true },
      orderBy: { startsAt: 'asc' },
    });
    if (sessions.length === 0) {
      return {
        range,
        totals: {
          sessions: 0,
          bookings: 0,
          activeWaitlists: 0,
          utilizationPercent: 0,
          waitlistPressurePercent: 0,
        },
        trend: [],
      };
    }
    const sessionIds = sessions.map((s) => s.id);
    const [bookings, waitlists] = await Promise.all([
      this.prisma.booking.findMany({
        where: { sessionId: { in: sessionIds }, status: BookingStatus.BOOKED },
        select: { sessionId: true },
      }),
      this.prisma.waitlistEntry.findMany({
        where: { sessionId: { in: sessionIds }, status: 'ACTIVE' },
        select: { sessionId: true },
      }),
    ]);

    const bookedBySession = this.countBySessionId(bookings);
    const waitlistBySession = this.countBySessionId(waitlists);
    const daily = new Map<
      string,
      {
        date: string;
        sessions: number;
        bookings: number;
        waitlists: number;
        capacity: number;
      }
    >();
    for (const session of sessions) {
      const date = session.startsAt.toISOString().slice(0, 10);
      const prev = daily.get(date) ?? {
        date,
        sessions: 0,
        bookings: 0,
        waitlists: 0,
        capacity: 0,
      };
      prev.sessions += 1;
      prev.bookings += bookedBySession.get(session.id) ?? 0;
      prev.waitlists += waitlistBySession.get(session.id) ?? 0;
      prev.capacity += session.capacity;
      daily.set(date, prev);
    }

    const totals = [...daily.values()].reduce(
      (acc, day) => {
        acc.sessions += day.sessions;
        acc.bookings += day.bookings;
        acc.activeWaitlists += day.waitlists;
        acc.capacity += day.capacity;
        return acc;
      },
      { sessions: 0, bookings: 0, activeWaitlists: 0, capacity: 0 },
    );
    const utilizationPercent =
      totals.capacity > 0
        ? Math.round((totals.bookings / totals.capacity) * 100)
        : 0;
    const waitlistPressurePercent =
      totals.sessions > 0
        ? Math.round((totals.activeWaitlists / totals.sessions) * 100)
        : 0;

    return {
      range,
      totals: {
        sessions: totals.sessions,
        bookings: totals.bookings,
        activeWaitlists: totals.activeWaitlists,
        utilizationPercent,
        waitlistPressurePercent,
      },
      trend: [...daily.values()],
    };
  }

  async userAnalytics(userId: string, days: number) {
    const range = this.resolveRelativeDays(days);
    const [bookings, payments, memberships] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          userId,
          session: { startsAt: { gte: range.from, lte: range.to } },
        },
        select: {
          id: true,
          status: true,
          session: {
            select: {
              startsAt: true,
              endsAt: true,
              classType: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.payment.findMany({
        where: {
          userId,
          createdAt: { gte: range.from, lte: range.to },
          status: PaymentStatus.SUCCEEDED,
        },
        select: { amountCents: true, createdAt: true, description: true },
      }),
      this.prisma.userMembership.findMany({
        where: {
          userId,
          createdAt: { lte: range.to },
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          plan: {
            select: { name: true, sessionsPerMonth: true, isUnlimited: true },
          },
        },
      }),
    ]);

    const completed = bookings.filter(
      (b) => b.status === BookingStatus.COMPLETED,
    );
    const completedHours = completed.reduce((sum, booking) => {
      const start = booking.session.startsAt.getTime();
      const end = booking.session.endsAt.getTime();
      return sum + Math.max(0, end - start) / 1000 / 60 / 60;
    }, 0);
    const activeDays = new Set(
      completed.map((b) => b.session.startsAt.toDateString()),
    ).size;
    const classTypeCounter = new Map<string, number>();
    for (const booking of completed) {
      const key = booking.session.classType.name;
      classTypeCounter.set(key, (classTypeCounter.get(key) ?? 0) + 1);
    }
    const favoriteClassType = [...classTypeCounter.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0];
    const spendCents = payments.reduce(
      (sum, payment) => sum + payment.amountCents,
      0,
    );

    const spendTrendMap = new Map<string, number>();
    for (const payment of payments) {
      const key = payment.createdAt.toISOString().slice(0, 10);
      spendTrendMap.set(
        key,
        (spendTrendMap.get(key) ?? 0) + payment.amountCents,
      );
    }
    const attendanceTrendMap = new Map<string, number>();
    for (const booking of completed) {
      const key = booking.session.startsAt.toISOString().slice(0, 10);
      attendanceTrendMap.set(key, (attendanceTrendMap.get(key) ?? 0) + 1);
    }

    const currentMembership = memberships[0] ?? null;
    return {
      range,
      totals: {
        completedClasses: completed.length,
        totalHours: Number(completedHours.toFixed(1)),
        activeDays,
        favoriteClassType,
        spendCents,
      },
      membership: currentMembership
        ? {
            planName: currentMembership.plan.name,
            sessionsRemaining: currentMembership.sessionsRemaining,
            sessionsPerMonth: currentMembership.plan.sessionsPerMonth,
            isUnlimited: currentMembership.plan.isUnlimited,
            currentPeriodEnd: currentMembership.currentPeriodEnd,
          }
        : null,
      trend: {
        attendance: [...attendanceTrendMap.entries()].map(([date, count]) => ({
          date,
          count,
        })),
        spend: [...spendTrendMap.entries()].map(([date, amountCents]) => ({
          date,
          amountCents,
        })),
      },
    };
  }

  private resolveRange(input: DateRangeQueryDto): { from: string; to: string } {
    const to = input.to ? new Date(input.to) : new Date();
    const from = input.from
      ? new Date(input.from)
      : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { from: from.toISOString(), to: to.toISOString() };
  }

  private resolveRelativeDays(days: number): { from: Date; to: Date } {
    const safeDays = Math.max(1, days);
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - safeDays + 1);
    from.setHours(0, 0, 0, 0);
    return { from, to };
  }

  private buildPaymentDateFilter(
    range: DateRangeQueryDto,
  ): Prisma.DateTimeFilter | undefined {
    if (!range.from && !range.to) {
      return undefined;
    }
    return {
      ...(range.from ? { gte: new Date(range.from) } : {}),
      ...(range.to ? { lte: new Date(range.to) } : {}),
    };
  }

  private detectPaymentSource(
    description: string | null,
  ): 'membership' | 'dropin' | 'gift' | 'other' {
    const normalized = (description ?? '').toLowerCase();
    if (normalized.startsWith('membership')) {
      return 'membership';
    }
    if (normalized.startsWith('drop-in')) {
      return 'dropin';
    }
    if (normalized.startsWith('gift')) {
      return 'gift';
    }
    return 'other';
  }

  private countBySessionId(
    items: Array<{ sessionId: string }>,
  ): Map<string, number> {
    const result = new Map<string, number>();
    for (const item of items) {
      result.set(item.sessionId, (result.get(item.sessionId) ?? 0) + 1);
    }
    return result;
  }
}
