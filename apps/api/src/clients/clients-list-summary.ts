import {
  BookingStatus,
  PaymentStatus,
  Prisma,
  type PrismaClient,
} from '@prisma/client';
import {
  CLIENTS_FILTER_OPTIONS_SCAN_LIMIT,
  INACTIVE_CLIENT_DAYS,
} from './clients-list.constants';

export type ClientListRowSummaryFields = {
  classLevels: string[];
  preferredCoach: { id: string; name: string } | null;
  tags: Array<'VIP' | 'New' | 'At Risk' | 'Beginner'>;
  status: 'Active' | 'Inactive' | 'Blocked';
  totalVisits: number;
  lifetimeValueCents: number;
};

export async function computeClientsSummaryFromDb(
  prisma: PrismaClient,
  where: Prisma.UserWhereInput,
) {
  const inactiveThreshold = new Date(
    Date.now() - INACTIVE_CLIENT_DAYS * 24 * 60 * 60 * 1000,
  );
  const activeWhere: Prisma.UserWhereInput = {
    AND: [
      where,
      {
        isBlocked: false,
        bookings: {
          some: {
            status: BookingStatus.COMPLETED,
            session: { startsAt: { gte: inactiveThreshold } },
          },
        },
      },
    ],
  };
  const atRiskWhere: Prisma.UserWhereInput = {
    AND: [
      where,
      {
        OR: [
          { payments: { some: { status: PaymentStatus.FAILED } } },
          {
            payments: { none: { status: PaymentStatus.SUCCEEDED } },
            NOT: { payments: { some: { status: PaymentStatus.FAILED } } },
          },
        ],
      },
    ],
  };

  const [total, active, atRisk, totalVisits, paymentAggregate] =
    await Promise.all([
      prisma.user.count({ where }),
      prisma.user.count({ where: activeWhere }),
      prisma.user.count({ where: atRiskWhere }),
      prisma.booking.count({
        where: {
          status: BookingStatus.COMPLETED,
          user: where,
        },
      }),
      prisma.payment.aggregate({
        where: {
          status: PaymentStatus.SUCCEEDED,
          user: where,
        },
        _sum: { amountCents: true },
      }),
    ]);

  return {
    total,
    active,
    vip: 0,
    atRisk,
    totalVisits,
    lifetimeValueCents: paymentAggregate._sum.amountCents ?? 0,
  };
}

export function summaryFromRows(rows: ClientListRowSummaryFields[]) {
  return {
    total: rows.length,
    active: rows.filter((row) => row.status === 'Active').length,
    vip: rows.filter((row) => row.tags.includes('VIP')).length,
    atRisk: rows.filter((row) => row.tags.includes('At Risk')).length,
    totalVisits: rows.reduce((sum, row) => sum + row.totalVisits, 0),
    lifetimeValueCents: rows.reduce(
      (sum, row) => sum + row.lifetimeValueCents,
      0,
    ),
  };
}

export function filterOptionsFromRows(
  rows: Pick<ClientListRowSummaryFields, 'preferredCoach' | 'classLevels'>[],
) {
  const coaches = new Map<string, string>();
  for (const row of rows) {
    if (row.preferredCoach) {
      coaches.set(row.preferredCoach.id, row.preferredCoach.name);
    }
  }
  return {
    preferredCoaches: [...coaches.entries()].map(([id, name]) => ({ id, name })),
    classLevels: Array.from(new Set(rows.flatMap((row) => row.classLevels))).sort(),
  };
}

export async function computeClientsFilterOptionsFromDb<T extends Prisma.UserInclude>(
  prisma: PrismaClient,
  where: Prisma.UserWhereInput,
  include: T,
  mapUser: (user: Prisma.UserGetPayload<{ include: T }>) => Pick<
    ClientListRowSummaryFields,
    'preferredCoach' | 'classLevels'
  >,
) {
  const users = await prisma.user.findMany({
    where,
    include,
    take: CLIENTS_FILTER_OPTIONS_SCAN_LIMIT,
    orderBy: { createdAt: 'desc' },
  });
  return filterOptionsFromRows(users.map(mapUser));
}
