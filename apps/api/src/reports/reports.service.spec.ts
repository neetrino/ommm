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

describe('ReportsService', () => {
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
    expect(result.bySource.membership.amountCents).toBe(5_000);
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

    expect(csv).toContain('eventType,eventAt,userId,userEmail,userName,amountCents');
    expect(csv).toContain('"ISSUED"');
    expect(csv).toContain('"REDEEMED"');
    expect(csv).toContain('"SPENT"');
  });
});
