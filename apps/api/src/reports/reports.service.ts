import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  ClassSessionStatus,
  GiftCardStatus,
  PaymentStatus,
  Prisma,
  Role,
  WaitlistStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DateRangeQueryDto } from './dto/date-range-query.dto';

const GIFT_CREDIT_CURRENCY = 'amd';
const UPCOMING_ITEMS_LIMIT = 6;
const RECENT_USERS_LIMIT = 5;
const WAITLIST_ALERT_THRESHOLD = 3;

type DashboardOptions = {
  includeRevenue?: boolean;
  includeOverview?: boolean;
};

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(options?: DashboardOptions) {
    const includeRevenue = options?.includeRevenue === true;
    const includeOverview = options?.includeOverview === true;
    const { todayStart, todayEnd } = this.getLocalDayBounds();
    const now = new Date();

    const baseDashboard = await this.getBaseDashboard(
      todayStart,
      todayEnd,
      includeRevenue,
    );
    if (!includeOverview) {
      return baseDashboard;
    }

    const details = await this.getOverviewDetails(todayStart, todayEnd, now);

    return {
      ...baseDashboard,
      ...details,
    };
  }

  private async getBaseDashboard(
    todayStart: Date,
    todayEnd: Date,
    includeRevenue: boolean,
  ) {
    const [
      sessionsToday,
      bookingsToday,
      waitlistCount,
      membersCount,
      revenueAgg,
    ] = await Promise.all([
      this.prisma.classSession.count({
        where: this.buildTodaySessionsWhere(todayStart, todayEnd),
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
      this.prisma.user.count({
        where: {
          role: Role.USER,
          bookings: {
            some: {
              status: BookingStatus.COMPLETED,
              session: {
                startsAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
              },
            },
          },
        },
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

  private async getOverviewDetails(
    todayStart: Date,
    todayEnd: Date,
    now: Date,
  ) {
    const monthStart = this.getMonthStart(now);
    const nextMonthStart = this.getNextMonthStart(now);
    const previousMonthStart = this.getPreviousMonthStart(now);

    const [
      todayClasses,
      bookingsByStatusRaw,
      waitlistPressureCount,
      todayRevenueAgg,
      monthRevenueAgg,
      previousMonthRevenueAgg,
      pendingPaymentsAgg,
      upcomingBookingCancellations,
      newUsersToday,
      recentUsers,
      fullClassesToday,
      cancelledClassesToday,
      draftClassesUpcoming,
    ] = await Promise.all([
      this.prisma.classSession.findMany({
        where: this.buildTodaySessionsWhere(todayStart, todayEnd),
        include: {
          classType: { select: { name: true } },
          coach: {
            select: {
              user: { select: { name: true, lastName: true, email: true } },
            },
          },
          _count: {
            select: {
              bookings: { where: { status: BookingStatus.BOOKED } },
            },
          },
        },
        orderBy: { startsAt: 'asc' },
      }),
      this.prisma.booking.groupBy({
        by: ['status'],
        where: {
          session: { startsAt: { gte: todayStart, lt: todayEnd } },
        },
        _count: { id: true },
      }),
      this.prisma.waitlistEntry.groupBy({
        by: ['sessionId'],
        where: { status: WaitlistStatus.ACTIVE },
        _count: { id: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.SUCCEEDED,
          createdAt: { gte: todayStart, lt: todayEnd },
        },
        _sum: { amountCents: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.SUCCEEDED,
          createdAt: { gte: monthStart, lt: nextMonthStart },
        },
        _sum: { amountCents: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.SUCCEEDED,
          createdAt: { gte: previousMonthStart, lt: monthStart },
        },
        _sum: { amountCents: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.PENDING },
        _count: { id: true },
        _sum: { amountCents: true },
      }),
      this.prisma.booking.findMany({
        where: {
          status: BookingStatus.CANCELLED,
          cancelledAt: { not: null },
          session: { startsAt: { gte: now } },
        },
        include: {
          user: { select: { name: true, lastName: true, email: true } },
          session: {
            select: { startsAt: true, classType: { select: { name: true } } },
          },
        },
        orderBy: [{ session: { startsAt: 'asc' } }, { cancelledAt: 'desc' }],
        take: UPCOMING_ITEMS_LIMIT,
      }),
      this.prisma.user.count({
        where: {
          role: Role.USER,
          createdAt: { gte: todayStart, lt: todayEnd },
        },
      }),
      this.prisma.user.findMany({
        where: { role: Role.USER },
        select: {
          id: true,
          createdAt: true,
          name: true,
          lastName: true,
          email: true,
        },
        orderBy: { createdAt: 'desc' },
        take: RECENT_USERS_LIMIT,
      }),
      this.prisma.classSession.count({
        where: {
          startsAt: { gte: todayStart, lt: todayEnd },
          status: ClassSessionStatus.FULL,
        },
      }),
      this.prisma.classSession.count({
        where: {
          startsAt: { gte: todayStart, lt: todayEnd },
          status: ClassSessionStatus.CANCELLED,
        },
      }),
      this.prisma.classSession.count({
        where: {
          startsAt: { gte: now },
          status: ClassSessionStatus.DRAFT,
        },
      }),
    ]);

    const bookingsByStatus = this.mapBookingStatusCounts(bookingsByStatusRaw);
    const upcomingClasses = todayClasses
      .slice(0, UPCOMING_ITEMS_LIMIT)
      .map((session) => ({
        id: session.id,
        className: session.classType.name,
        startsAt: session.startsAt.toISOString(),
        coachName: this.joinName(
          session.coach.user.name,
          session.coach.user.lastName,
          session.coach.user.email,
        ),
        bookedCount: session._count.bookings,
        capacity: session.capacity,
        status: session.status,
      }));

    const revenue = this.resolveRevenueSummary(
      todayRevenueAgg._sum.amountCents ?? 0,
      monthRevenueAgg._sum.amountCents ?? 0,
      previousMonthRevenueAgg._sum.amountCents ?? 0,
      pendingPaymentsAgg._sum.amountCents ?? 0,
      pendingPaymentsAgg._count.id ?? 0,
    );

    const upcomingCancellations = upcomingBookingCancellations
      .map((booking) => ({
        id: booking.id,
        type: 'booking' as const,
        userName: this.joinName(
          booking.user.name,
          booking.user.lastName,
          booking.user.email,
        ),
        itemName: booking.session.classType.name,
        dateTime: booking.session.startsAt.toISOString(),
        status: booking.status,
      }))
      .sort((a, b) => a.dateTime.localeCompare(b.dateTime))
      .slice(0, UPCOMING_ITEMS_LIMIT);

    const alerts = this.buildAlerts({
      fullClassesToday,
      waitlistPressureCount: waitlistPressureCount.filter(
        (entry) => entry._count.id >= WAITLIST_ALERT_THRESHOLD,
      ).length,
      cancelledClassesToday,
      pendingPaymentsCount: pendingPaymentsAgg._count.id ?? 0,
      draftClassesUpcoming,
      upcomingCancellationsCount: upcomingCancellations.length,
    });

    return {
      bookingsByStatus,
      upcomingClasses,
      revenue,
      upcomingCancellations,
      newUsers: {
        todayCount: newUsersToday,
        recent: recentUsers.map((user) => ({
          id: user.id,
          name: this.joinName(user.name, user.lastName, user.email),
          email: user.email,
          createdAt: user.createdAt.toISOString(),
        })),
      },
      alerts,
    };
  }

  private mapBookingStatusCounts(
    rows: Array<{ status: BookingStatus; _count: { id: number } }>,
  ) {
    const initial: Record<BookingStatus, number> = {
      BOOKED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      MISSED: 0,
    };

    for (const row of rows) {
      initial[row.status] = row._count.id;
    }

    return initial;
  }

  private resolveRevenueSummary(
    todayRevenueCents: number,
    monthRevenueCents: number,
    previousMonthRevenueCents: number,
    pendingPaymentsCents: number,
    pendingPaymentsCount: number,
  ) {
    const trendPercent =
      previousMonthRevenueCents > 0
        ? Math.round(
            ((monthRevenueCents - previousMonthRevenueCents) /
              previousMonthRevenueCents) *
              100,
          )
        : null;

    return {
      todayRevenueCents,
      monthRevenueCents,
      pendingPaymentsCents,
      pendingPaymentsCount,
      trendPercent,
    };
  }

  private buildAlerts(input: {
    fullClassesToday: number;
    waitlistPressureCount: number;
    cancelledClassesToday: number;
    pendingPaymentsCount: number;
    draftClassesUpcoming: number;
    upcomingCancellationsCount: number;
  }) {
    const alerts: Array<{
      code: string;
      level: 'info' | 'warning';
      count: number;
    }> = [];

    if (input.fullClassesToday > 0) {
      alerts.push({
        code: 'classes_full_today',
        level: 'info',
        count: input.fullClassesToday,
      });
    }
    if (input.waitlistPressureCount > 0) {
      alerts.push({
        code: 'waitlist_pressure',
        level: 'warning',
        count: input.waitlistPressureCount,
      });
    }
    if (input.cancelledClassesToday > 0) {
      alerts.push({
        code: 'classes_cancelled_today',
        level: 'warning',
        count: input.cancelledClassesToday,
      });
    }
    if (input.pendingPaymentsCount > 0) {
      alerts.push({
        code: 'payments_pending',
        level: 'warning',
        count: input.pendingPaymentsCount,
      });
    }
    if (input.draftClassesUpcoming > 0) {
      alerts.push({
        code: 'draft_classes_upcoming',
        level: 'info',
        count: input.draftClassesUpcoming,
      });
    }
    if (input.upcomingCancellationsCount > 0) {
      alerts.push({
        code: 'upcoming_cancellations',
        level: 'info',
        count: input.upcomingCancellationsCount,
      });
    }

    return alerts;
  }

  /** Local calendar day bounds — shared by dashboard stats and today's class list. */
  private getLocalDayBounds(referenceDate: Date = new Date()): {
    todayStart: Date;
    todayEnd: Date;
  } {
    const todayStart = new Date(referenceDate);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    return { todayStart, todayEnd };
  }

  private buildTodaySessionsWhere(
    todayStart: Date,
    todayEnd: Date,
  ): Prisma.ClassSessionWhereInput {
    return {
      startsAt: { gte: todayStart, lt: todayEnd },
      status: { not: ClassSessionStatus.CANCELLED },
    };
  }

  private getMonthStart(now: Date): Date {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }

  private getNextMonthStart(now: Date): Date {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  }

  private getPreviousMonthStart(now: Date): Date {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  }

  private joinName(
    firstName: string | null,
    lastName: string | null,
    fallback: string,
  ): string {
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    return fullName.length > 0 ? fullName : fallback;
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
    const [
      totals,
      byStatusRaw,
      payments,
      issuedGiftCards,
      redeemedGiftCards,
      giftSpentAgg,
      giftLiabilityAgg,
    ] = await Promise.all([
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
      this.prisma.giftCard.findMany({
        where: {
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 10_000,
      }),
      this.prisma.giftCard.findMany({
        where: {
          status: GiftCardStatus.REDEEMED,
          ...(dateFilter ? { updatedAt: dateFilter } : {}),
        },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        take: 10_000,
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
        'package' | 'dropin' | 'gift' | 'other',
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
        package: { count: 0, amountCents: 0 },
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
    const issuedCount = issuedGiftCards.length;
    const redeemedCount = redeemedGiftCards.length;
    const issuedCents = issuedGiftCards.reduce(
      (sum, card) => sum + this.readGiftAmount(card),
      0,
    );
    const redeemedCents = redeemedGiftCards.reduce(
      (sum, card) => sum + this.readGiftAmount(card),
      0,
    );

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
        issuedCents,
        issuedCount,
        redeemedCents,
        redeemedCount,
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

  async giftCreditsCsv(range: DateRangeQueryDto): Promise<string> {
    const dateFilter = this.buildPaymentDateFilter(range);
    const [issuedCards, redeemedCards, spendPayments] = await Promise.all([
      this.prisma.giftCard.findMany({
        where: {
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
        include: {
          purchaser: {
            select: { id: true, email: true, name: true, lastName: true },
          },
          recipient: {
            select: { id: true, email: true, name: true, lastName: true },
          },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 10_000,
      }),
      this.prisma.giftCard.findMany({
        where: {
          status: GiftCardStatus.REDEEMED,
          ...(dateFilter ? { updatedAt: dateFilter } : {}),
        },
        include: {
          recipient: {
            select: { id: true, email: true, name: true, lastName: true },
          },
        },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        take: 10_000,
      }),
      this.prisma.payment.findMany({
        where: {
          ...(dateFilter ? { createdAt: dateFilter } : {}),
          status: PaymentStatus.SUCCEEDED,
          description: { startsWith: 'Gift credit spend' },
        },
        include: {
          user: {
            select: { id: true, email: true, name: true, lastName: true },
          },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 10_000,
      }),
    ]);

    const rows: string[] = [];
    for (const card of issuedCards) {
      rows.push(
        this.toCsvRow([
          'ISSUED',
          card.createdAt.toISOString(),
          card.purchaser.id,
          card.purchaser.email,
          `${card.purchaser.name ?? ''} ${card.purchaser.lastName ?? ''}`.trim(),
          this.readGiftAmount(card),
          GIFT_CREDIT_CURRENCY,
          card.code,
          card.recipientEmail ??
            card.recipient?.email ??
            card.recipientName ??
            '',
        ]),
      );
    }
    for (const card of redeemedCards) {
      rows.push(
        this.toCsvRow([
          'REDEEMED',
          card.updatedAt.toISOString(),
          card.recipient?.id ?? '',
          card.recipient?.email ?? '',
          `${card.recipient?.name ?? ''} ${card.recipient?.lastName ?? ''}`.trim(),
          this.readGiftAmount(card),
          GIFT_CREDIT_CURRENCY,
          card.code,
          '',
        ]),
      );
    }
    for (const payment of spendPayments) {
      rows.push(
        this.toCsvRow([
          'SPENT',
          payment.createdAt.toISOString(),
          payment.userId,
          payment.user.email,
          `${payment.user.name ?? ''} ${payment.user.lastName ?? ''}`.trim(),
          payment.amountCents,
          payment.currency,
          payment.id,
          payment.description ?? '',
        ]),
      );
    }

    const header =
      'eventType,eventAt,userId,userEmail,userName,amountCents,currency,reference,notes\n';
    return header + rows.join('\n');
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
    const [bookings, payments] = await Promise.all([
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

    return {
      range,
      totals: {
        completedClasses: completed.length,
        totalHours: Number(completedHours.toFixed(1)),
        activeDays,
        favoriteClassType,
        spendCents,
      },
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
  ): 'package' | 'dropin' | 'gift' | 'other' {
    const normalized = (description ?? '').toLowerCase();
    if (
      normalized.startsWith('membership') ||
      normalized.startsWith('package')
    ) {
      return 'package';
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

  private readGiftAmount(card: {
    amountCents?: number;
    amountAmd?: number;
  }): number {
    if (typeof card.amountAmd === 'number') {
      return card.amountAmd;
    }
    return card.amountCents ?? 0;
  }

  private toCsvRow(cells: ReadonlyArray<string | number>): string {
    return cells
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(',');
  }
}
