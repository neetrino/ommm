import { BookingStatus, Role } from '@prisma/client';
import { revenueSucceededWhere } from '../payments/payment-revenue.util';
import { computeClientsSummaryFromDb } from './clients-list-summary';

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
      vip: 0,
      totalVisits: 9,
      lifetimeValueCents: 25_000,
    });
    expect(prisma.user.count).toHaveBeenNthCalledWith(1, { where });
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
