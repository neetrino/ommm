import { BookingStatus, Role, UserPackageStatus } from '@prisma/client';
import { revenueSucceededWhere } from '../payments/payment-revenue.util';
import {
  computeClientsSummaryFromDb,
  summaryFromRows,
} from './clients-list-summary';

describe('computeClientsSummaryFromDb', () => {
  it('aggregates lifetime value with cash-revenue where so influencer comps are excluded', async () => {
    const where = { role: Role.USER };
    const prisma = {
      user: { count: jest.fn().mockResolvedValue(4) },
      booking: { count: jest.fn().mockResolvedValue(9) },
      payment: {
        aggregate: jest.fn().mockResolvedValue({
          _sum: { amountCents: 25_000 },
        }),
      },
    };

    const result = await computeClientsSummaryFromDb(prisma as never, where);

    expect(result).toEqual({
      total: 4,
      active: 4,
      withPackage: 4,
      vip: 0,
      totalVisits: 9,
      lifetimeValueCents: 25_000,
    });
    expect(prisma.user.count).toHaveBeenNthCalledWith(1, { where });
    expect(prisma.user.count).toHaveBeenNthCalledWith(3, {
      where: {
        AND: [
          where,
          { userPackages: { some: { status: UserPackageStatus.ACTIVE } } },
        ],
      },
    });
    expect(prisma.booking.count).toHaveBeenCalledWith({
      where: {
        status: BookingStatus.COMPLETED,
        user: where,
      },
    });
    expect(prisma.payment.aggregate).toHaveBeenCalledWith({
      where: {
        ...revenueSucceededWhere,
        user: where,
      },
      _sum: { amountCents: true },
    });
  });
});

describe('summaryFromRows', () => {
  it('counts clients with an ACTIVE membership separately from visit-active clients', () => {
    const result = summaryFromRows([
      {
        classLevels: [],
        preferredCoach: null,
        tags: [],
        status: 'Inactive',
        activePackageStatus: UserPackageStatus.ACTIVE,
        totalVisits: 0,
        lifetimeValueCents: 0,
      },
      {
        classLevels: [],
        preferredCoach: null,
        tags: ['VIP'],
        status: 'Active',
        activePackageStatus: null,
        totalVisits: 3,
        lifetimeValueCents: 1000,
      },
    ]);

    expect(result.total).toBe(2);
    expect(result.active).toBe(1);
    expect(result.withPackage).toBe(1);
    expect(result.vip).toBe(1);
    expect(result.totalVisits).toBe(3);
  });
});
