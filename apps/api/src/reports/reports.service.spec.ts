import {
  BookingStatus,
  ClassSessionStatus,
  PaymentStatus,
} from '@prisma/client';
import { ReportsService } from './reports.service';

function createServiceWithPrisma(
  prismaMock: Record<string, unknown>,
): ReportsService {
  return new ReportsService(prismaMock as never);
}

type DashboardOverviewResult = {
  sessionsToday: number;
  upcomingClasses: Array<{ id: string }>;
};

function assertDashboardOverview(
  result: unknown,
): asserts result is DashboardOverviewResult {
  if (
    typeof result !== 'object' ||
    result === null ||
    !('upcomingClasses' in result) ||
    !Array.isArray((result as DashboardOverviewResult).upcomingClasses)
  ) {
    throw new Error('Expected dashboard overview payload');
  }
}

describe('ReportsService', () => {
  it('dashboard returns base counters without overview details', async () => {
    const prismaMock = {
      classSession: {
        count: jest.fn().mockResolvedValue(8),
      },
      booking: {
        count: jest.fn().mockResolvedValue(42),
      },
      waitlistEntry: {
        count: jest.fn().mockResolvedValue(6),
      },
      userMembership: {
        count: jest.fn().mockResolvedValue(120),
      },
      payment: {
        aggregate: jest.fn().mockResolvedValue({
          _sum: { amountCents: 500_000 },
        }),
      },
    };
    const service = createServiceWithPrisma(prismaMock);

    const result = await service.dashboard({ includeRevenue: true });

    expect(result.sessionsToday).toBe(8);
    expect(result.bookingsToday).toBe(42);
    expect(result.activeWaitlists).toBe(6);
    expect(result.activeMembers).toBe(120);
    expect(result.revenueCentsTotal).toBe(500_000);
    expect(result).not.toHaveProperty('upcomingClasses');
  });

  it('dashboard overview lists all non-cancelled classes scheduled today', async () => {
    const { todayStart } = (() => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return { todayStart: start };
    })();
    const earlierToday = new Date(todayStart);
    earlierToday.setHours(9, 0, 0, 0);
    const laterToday = new Date(todayStart);
    laterToday.setHours(18, 0, 0, 0);

    const prismaMock = {
      classSession: {
        count: jest
          .fn()
          .mockResolvedValueOnce(2)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'past-today',
            startsAt: earlierToday,
            capacity: 10,
            status: ClassSessionStatus.ACTIVE,
            classType: { name: 'Morning Flow' },
            coach: {
              user: { name: 'Anna', lastName: 'Lee', email: 'anna@test.com' },
            },
            _count: { bookings: 4 },
          },
          {
            id: 'later-today',
            startsAt: laterToday,
            capacity: 12,
            status: ClassSessionStatus.ACTIVE,
            classType: { name: 'Evening Restore' },
            coach: {
              user: { name: 'Leo', lastName: 'Park', email: 'leo@test.com' },
            },
            _count: { bookings: 6 },
          },
        ]),
      },
      booking: {
        count: jest.fn().mockResolvedValue(0),
        groupBy: jest.fn().mockResolvedValue([]),
        findMany: jest.fn().mockResolvedValue([]),
      },
      waitlistEntry: {
        count: jest.fn().mockResolvedValue(0),
        groupBy: jest.fn().mockResolvedValue([]),
      },
      userMembership: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
      },
      payment: {
        aggregate: jest
          .fn()
          .mockResolvedValue({ _sum: { amountCents: 0 }, _count: { id: 0 } }),
      },
      user: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    const service = createServiceWithPrisma(prismaMock);

    const result = await service.dashboard({
      includeRevenue: true,
      includeOverview: true,
    });
    assertDashboardOverview(result);

    expect(result.sessionsToday).toBe(2);
    expect(result.upcomingClasses).toHaveLength(2);
    expect(result.upcomingClasses.map((session) => session.id)).toEqual([
      'past-today',
      'later-today',
    ]);
  });

  it('financeSummary returns aggregated totals, status and source breakdown', async () => {
    const prismaMock = {
      payment: {
        aggregate: jest.fn().mockResolvedValue({
          _sum: { amountCents: 15_000 },
          _count: { id: 3 },
        }),
        groupBy: jest.fn().mockResolvedValue([
          {
            status: PaymentStatus.SUCCEEDED,
            _sum: { amountCents: 15_000 },
            _count: { id: 3 },
          },
        ]),
        findMany: jest.fn().mockResolvedValue([
          {
            id: '1',
            amountCents: 5_000,
            description: 'Membership subscription',
            status: PaymentStatus.SUCCEEDED,
          },
          {
            id: '2',
            amountCents: 7_000,
            description: 'Drop-in session s1',
            status: PaymentStatus.SUCCEEDED,
          },
          {
            id: '3',
            amountCents: 3_000,
            description: 'Gift card',
            status: PaymentStatus.SUCCEEDED,
          },
        ]),
      },
      giftCard: {
        aggregate: jest
          .fn()
          .mockResolvedValueOnce({
            _sum: { amountCents: 4_000 },
            _count: { id: 1 },
          })
          .mockResolvedValueOnce({
            _sum: { amountCents: 2_000 },
            _count: { id: 1 },
          }),
      },
      user: {
        aggregate: jest.fn().mockResolvedValue({
          _sum: { giftCreditsCents: 1_500 },
        }),
      },
    };
    const service = createServiceWithPrisma(prismaMock);

    const result = await service.financeSummary({});

    expect(result.totals.revenueCents).toBe(15_000);
    expect(result.totals.averageOrderValueCents).toBe(5_000);
    expect(result.bySource.package.amountCents).toBe(5_000);
    expect(result.bySource.dropin.amountCents).toBe(7_000);
    expect(result.bySource.gift.amountCents).toBe(3_000);
    expect(result.giftCredits.issuedCents).toBe(4_000);
    expect(result.giftCredits.redeemedCents).toBe(2_000);
    expect(result.giftCredits.outstandingCreditsCents).toBe(1_500);
  });

  it('coachAnalytics computes totals and trend safely', async () => {
    const startsAt = new Date();
    startsAt.setHours(startsAt.getHours() - 1);
    const prismaMock = {
      coachProfile: {
        findUnique: jest.fn().mockResolvedValue({ id: 'coach1' }),
      },
      classSession: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 's1',
            capacity: 10,
            startsAt,
            status: ClassSessionStatus.ACTIVE,
          },
        ]),
      },
      booking: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { sessionId: 's1', status: BookingStatus.BOOKED },
          ]),
      },
      waitlistEntry: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    const service = createServiceWithPrisma(prismaMock);
    const result = await service.coachAnalytics('user1', 30);

    expect(result?.totals.sessions).toBe(1);
    expect(result?.totals.bookings).toBe(1);
    expect(result?.totals.utilizationPercent).toBe(10);
    expect(result?.trend.length).toBe(1);
  });

  it('giftCreditsCsv includes issued, redeemed and spent rows', async () => {
    const now = new Date('2026-05-28T09:00:00.000Z');
    const prismaMock = {
      giftCard: {
        findMany: jest
          .fn()
          .mockResolvedValueOnce([
            {
              code: 'GIFT-ISSUED',
              amountCents: 12_000,
              createdAt: now,
              purchaser: {
                id: 'admin-1',
                email: 'admin@test.com',
                name: 'Admin',
                lastName: 'One',
              },
              recipient: null,
              recipientEmail: 'client@test.com',
              recipientName: 'Client One',
            },
          ])
          .mockResolvedValueOnce([
            {
              code: 'GIFT-REDEEMED',
              amountCents: 8_000,
              updatedAt: now,
              recipient: {
                id: 'user-1',
                email: 'user@test.com',
                name: 'User',
                lastName: 'One',
              },
            },
          ]),
      },
      payment: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'pay-1',
            userId: 'user-1',
            amountCents: 3_000,
            currency: 'amd',
            createdAt: now,
            description: 'Gift credit spend for booking session-1',
            user: {
              id: 'user-1',
              email: 'user@test.com',
              name: 'User',
              lastName: 'One',
            },
          },
        ]),
      },
    };
    const service = createServiceWithPrisma(prismaMock);

    const csv = await service.giftCreditsCsv({});

    expect(csv).toContain(
      'eventType,eventAt,userId,userEmail,userName,amountCents',
    );
    expect(csv).toContain('"ISSUED"');
    expect(csv).toContain('"REDEEMED"');
    expect(csv).toContain('"SPENT"');
  });
});
