import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  ClassSessionStatus,
  PaymentStatus,
  Role,
  WaitlistStatus,
} from '@prisma/client';
import { revenueSucceededWhere } from '../payments/payment-revenue.util';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildAlerts,
  mapBookingStatusCounts,
  mapRecentUserSummaries,
  mapTodayUpcomingClasses,
  mapUpcomingBookingCancellations,
  resolveRevenueSummary,
} from './reports-dashboard.helpers';
import {
  buildTodaySessionsWhere,
  getLocalDayBounds,
  getMonthStart,
  getNextMonthStart,
  getPreviousMonthStart,
} from './reports.helpers';

const UPCOMING_ITEMS_LIMIT = 6;
const RECENT_USERS_LIMIT = 5;
const WAITLIST_ALERT_THRESHOLD = 3;

export type DashboardOptions = {
  includeRevenue?: boolean;
  includeOverview?: boolean;
};

@Injectable()
export class ReportsDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(options?: DashboardOptions) {
    const includeRevenue = options?.includeRevenue === true;
    const includeOverview = options?.includeOverview === true;
    const { todayStart, todayEnd } = getLocalDayBounds();
    const now = new Date();

    const baseDashboard = await this.getBaseDashboard(
      todayStart,
      todayEnd,
      includeRevenue,
    );
    if (!includeOverview) {
      return baseDashboard;
    }

    const details = await this.getOverviewDetails(
      todayStart,
      todayEnd,
      now,
      includeRevenue,
    );

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
        where: buildTodaySessionsWhere(todayStart, todayEnd),
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
            where: revenueSucceededWhere,
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
    includeRevenue: boolean,
  ) {
    const monthStart = getMonthStart(now);
    const nextMonthStart = getNextMonthStart(now);
    const previousMonthStart = getPreviousMonthStart(now);
    const emptyPaymentAgg = {
      _sum: { amountCents: 0 },
      _count: { id: 0 },
    };

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
        where: buildTodaySessionsWhere(todayStart, todayEnd),
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
      includeRevenue
        ? this.prisma.payment.aggregate({
            where: {
              ...revenueSucceededWhere,
              createdAt: { gte: todayStart, lt: todayEnd },
            },
            _sum: { amountCents: true },
          })
        : Promise.resolve(emptyPaymentAgg),
      includeRevenue
        ? this.prisma.payment.aggregate({
            where: {
              ...revenueSucceededWhere,
              createdAt: { gte: monthStart, lt: nextMonthStart },
            },
            _sum: { amountCents: true },
          })
        : Promise.resolve(emptyPaymentAgg),
      includeRevenue
        ? this.prisma.payment.aggregate({
            where: {
              ...revenueSucceededWhere,
              createdAt: { gte: previousMonthStart, lt: monthStart },
            },
            _sum: { amountCents: true },
          })
        : Promise.resolve(emptyPaymentAgg),
      includeRevenue
        ? this.prisma.payment.aggregate({
            where: { status: PaymentStatus.PENDING },
            _count: { id: true },
            _sum: { amountCents: true },
          })
        : Promise.resolve(emptyPaymentAgg),
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

    const bookingsByStatus = mapBookingStatusCounts(bookingsByStatusRaw);
    const upcomingClasses = mapTodayUpcomingClasses(
      todayClasses,
      UPCOMING_ITEMS_LIMIT,
    );

    const upcomingCancellations = mapUpcomingBookingCancellations(
      upcomingBookingCancellations,
      UPCOMING_ITEMS_LIMIT,
    );

    const alerts = buildAlerts({
      fullClassesToday,
      waitlistPressureCount: waitlistPressureCount.filter(
        (entry) => entry._count.id >= WAITLIST_ALERT_THRESHOLD,
      ).length,
      cancelledClassesToday,
      pendingPaymentsCount: includeRevenue
        ? (pendingPaymentsAgg._count.id ?? 0)
        : 0,
      draftClassesUpcoming,
      upcomingCancellationsCount: upcomingCancellations.length,
    });

    return {
      bookingsByStatus,
      upcomingClasses,
      ...(includeRevenue && {
        revenue: resolveRevenueSummary(
          todayRevenueAgg._sum.amountCents ?? 0,
          monthRevenueAgg._sum.amountCents ?? 0,
          previousMonthRevenueAgg._sum.amountCents ?? 0,
          pendingPaymentsAgg._sum.amountCents ?? 0,
          pendingPaymentsAgg._count.id ?? 0,
        ),
      }),
      upcomingCancellations,
      newUsers: {
        todayCount: newUsersToday,
        recent: mapRecentUserSummaries(recentUsers),
      },
      alerts,
    };
  }
}
