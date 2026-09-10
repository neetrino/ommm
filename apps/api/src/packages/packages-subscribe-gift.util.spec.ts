import { PaymentStatus, UserPackageStatus } from '@prisma/client';
import { createCashPackageSubscriptionWithGiftCredits } from './packages-subscribe-gift.util';

describe('createCashPackageSubscriptionWithGiftCredits', () => {
  it('creates an unpaid pending cash package without decrementing stock', async () => {
    const userPackageCreate = jest.fn().mockResolvedValue({ id: 'up-cash' });
    const paymentCreate = jest.fn().mockResolvedValue({
      id: 'pay-cash',
      amountCents: 80_000,
    });
    const packagePlanUpdateMany = jest.fn();
    const tx = {
      user: { update: jest.fn() },
      giftCard: { findMany: jest.fn(), update: jest.fn() },
      userPackage: { create: userPackageCreate },
      userPackageBalance: {
        create: jest.fn().mockResolvedValue({ id: 'bal-1' }),
      },
      payment: { create: paymentCreate },
      packagePlan: { updateMany: packagePlanUpdateMany },
    };

    const result = await createCashPackageSubscriptionWithGiftCredits(
      tx as never,
      {
        userId: 'user-1',
        plan: {
          id: 'plan-1',
          name: 'Reformer 8',
          priceCents: 100_000,
          discountedPriceCents: null,
          currency: 'AMD',
          periodDays: 30,
          startDate: null,
          sessionsPerMonth: 8,
          isUnlimited: false,
          guestCount: 0,
          categoryName: 'Reformer',
          typeSessionAllocations: [],
        } as never,
        giftCreditsAppliedCents: 0,
      },
    );

    expect(result).toMatchObject({
      userPackageId: 'up-cash',
      paymentId: 'pay-cash',
      stockTracked: false,
      chargeCents: 100_000,
    });
    expect(userPackageCreate.mock.calls[0]?.[0].data).toMatchObject({
      status: UserPackageStatus.PENDING,
    });
    expect(paymentCreate.mock.calls[0]?.[0].data).toMatchObject({
      status: PaymentStatus.PENDING,
      paymentMethod: 'CASH',
      confirmedAt: null,
    });
    expect(packagePlanUpdateMany).not.toHaveBeenCalled();
  });
});
