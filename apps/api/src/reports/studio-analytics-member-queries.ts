import { BookingStatus, Prisma, Role, UserPackageStatus } from '@prisma/client';
import { revenueSucceededWhere } from '../payments/payment-revenue.util';
import type { PrismaService } from '../prisma/prisma.service';
import {
  ACTIVE_MEMBERS_LOOKBACK_MS,
  emptyMemberCounts,
  PACKAGE_EXPIRING_MS,
} from './studio-analytics.helpers';
import type {
  StudioAnalyticsFilters,
  StudioAnalyticsLoadMode,
  StudioAnalyticsMemberCounts,
} from './studio-analytics.types';

type MemberQueryParams = {
  from: Date;
  to: Date;
  filters: StudioAnalyticsFilters;
  mode: StudioAnalyticsLoadMode;
  previous?: { from: Date; to: Date };
};

type SessionWhereFactory = (
  from: Date,
  to: Date,
  filters: StudioAnalyticsFilters,
) => Prisma.ClassSessionWhereInput;

export async function loadStudioAnalyticsMembers(
  prisma: PrismaService,
  params: MemberQueryParams,
  sessionWhere: SessionWhereFactory,
): Promise<StudioAnalyticsMemberCounts> {
  const newInRange = await prisma.user.count({
    where: {
      role: Role.USER,
      createdAt: { gte: params.from, lte: params.to },
    },
  });
  if (params.mode === 'comparison') {
    return { ...emptyMemberCounts(), newInRange };
  }
  return loadFullMembers(prisma, params, sessionWhere, newInRange);
}

async function loadFullMembers(
  prisma: PrismaService,
  params: MemberQueryParams,
  sessionWhere: SessionWhereFactory,
  newInRange: number,
): Promise<StudioAnalyticsMemberCounts> {
  const now = new Date();
  const activeSince = new Date(now.getTime() - ACTIVE_MEMBERS_LOOKBACK_MS);
  const expiringUntil = new Date(now.getTime() + PACKAGE_EXPIRING_MS);
  const sessionInRange = sessionWhere(params.from, params.to, params.filters);
  const counts = await queryMemberTotals(
    prisma,
    params,
    sessionWhere,
    sessionInRange,
    activeSince,
    now,
    expiringUntil,
  );
  return {
    ...emptyMemberCounts(),
    ...counts,
    vip: 0,
    newInRange,
    lifetimeValueCents: counts.lifetimeValueCents,
  };
}

async function queryMemberTotals(
  prisma: PrismaService,
  params: MemberQueryParams,
  sessionWhere: SessionWhereFactory,
  sessionInRange: Prisma.ClassSessionWhereInput,
  activeSince: Date,
  now: Date,
  expiringUntil: Date,
) {
  const [
    total,
    active,
    returningInRange,
    firstVisitsInRange,
    inactive30d,
    totalVisitsInRange,
    lifetimeValue,
    retention,
    packages,
  ] = await Promise.all([
    prisma.user.count({ where: { role: Role.USER } }),
    countActiveMembers(prisma, activeSince),
    countReturning(prisma, sessionInRange, params.from),
    countFirstVisits(prisma, sessionInRange, params.from),
    countInactive30d(prisma, activeSince),
    prisma.booking.count({
      where: { status: BookingStatus.COMPLETED, session: sessionInRange },
    }),
    prisma.payment.aggregate({
      where: { ...revenueSucceededWhere, user: { role: Role.USER } },
      _sum: { amountCents: true },
    }),
    loadRetention(prisma, params, sessionWhere, sessionInRange),
    loadPackageCounts(prisma, params.from, params.to, now, expiringUntil),
  ]);
  return {
    total,
    active,
    returningInRange,
    inactive30d,
    firstVisitsInRange,
    totalVisitsInRange,
    lifetimeValueCents: lifetimeValue._sum.amountCents ?? 0,
    retentionCohortSize: retention.cohort,
    retentionReturned: retention.returned,
    packages,
  };
}

function countActiveMembers(prisma: PrismaService, activeSince: Date) {
  return prisma.user.count({
    where: {
      role: Role.USER,
      bookings: {
        some: {
          status: BookingStatus.COMPLETED,
          session: { startsAt: { gte: activeSince } },
        },
      },
    },
  });
}

function countReturning(
  prisma: PrismaService,
  sessionInRange: Prisma.ClassSessionWhereInput,
  from: Date,
) {
  return prisma.user.count({
    where: {
      role: Role.USER,
      AND: [
        {
          bookings: {
            some: { status: BookingStatus.COMPLETED, session: sessionInRange },
          },
        },
        {
          bookings: {
            some: {
              status: BookingStatus.COMPLETED,
              session: { startsAt: { lt: from } },
            },
          },
        },
      ],
    },
  });
}

function countFirstVisits(
  prisma: PrismaService,
  sessionInRange: Prisma.ClassSessionWhereInput,
  from: Date,
) {
  return prisma.user.count({
    where: {
      role: Role.USER,
      bookings: {
        some: { status: BookingStatus.COMPLETED, session: sessionInRange },
      },
      NOT: {
        bookings: {
          some: {
            status: BookingStatus.COMPLETED,
            session: { startsAt: { lt: from } },
          },
        },
      },
    },
  });
}

function countInactive30d(prisma: PrismaService, activeSince: Date) {
  return prisma.user.count({
    where: {
      role: Role.USER,
      bookings: { some: { status: BookingStatus.COMPLETED } },
      NOT: {
        bookings: {
          some: {
            status: BookingStatus.COMPLETED,
            session: { startsAt: { gte: activeSince } },
          },
        },
      },
    },
  });
}

async function loadRetention(
  prisma: PrismaService,
  params: MemberQueryParams,
  sessionWhere: SessionWhereFactory,
  sessionInRange: Prisma.ClassSessionWhereInput,
) {
  if (!params.previous) {
    return { cohort: 0, returned: 0 };
  }
  const previousSession = sessionWhere(
    params.previous.from,
    params.previous.to,
    params.filters,
  );
  const completedIn = (session: Prisma.ClassSessionWhereInput) => ({
    bookings: {
      some: { status: BookingStatus.COMPLETED, session },
    },
  });
  const [cohort, returned] = await Promise.all([
    prisma.user.count({
      where: { role: Role.USER, ...completedIn(previousSession) },
    }),
    prisma.user.count({
      where: {
        role: Role.USER,
        AND: [completedIn(previousSession), completedIn(sessionInRange)],
      },
    }),
  ]);
  return { cohort, returned };
}

async function loadPackageCounts(
  prisma: PrismaService,
  from: Date,
  to: Date,
  now: Date,
  expiringUntil: Date,
) {
  const [active, paused, expiring7d, expiredInRange] = await Promise.all([
    prisma.userPackage.count({ where: { status: UserPackageStatus.ACTIVE } }),
    prisma.userPackage.count({ where: { status: UserPackageStatus.PAUSED } }),
    prisma.userPackage.count({
      where: {
        status: UserPackageStatus.ACTIVE,
        currentPeriodEnd: { gte: now, lte: expiringUntil },
      },
    }),
    prisma.userPackage.count({
      where: {
        status: UserPackageStatus.EXPIRED,
        OR: [
          { updatedAt: { gte: from, lte: to } },
          { currentPeriodEnd: { gte: from, lte: to } },
        ],
      },
    }),
  ]);
  return { active, paused, expiring7d, expiredInRange };
}
