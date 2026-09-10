import { UserPackageStatus } from '@prisma/client';
import { PaymentsFulfillmentService } from './payments-fulfillment.service';

describe('PaymentsFulfillmentService package confirm', () => {
  it('activates a PENDING studio package when payment is fulfilled', async () => {
    const userPackageUpdate = jest.fn().mockResolvedValue({});
    const tx = {
      userPackage: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'up-1',
          status: UserPackageStatus.PENDING,
          planId: 'plan-1',
          createdAt: new Date('2026-09-01T00:00:00.000Z'),
          plan: { startDate: null, name: 'Reformer', currency: 'amd' },
        }),
        update: userPackageUpdate,
      },
      payment: {
        update: jest.fn().mockResolvedValue({}),
        create: jest.fn(),
      },
      packagePlan: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const service = new PaymentsFulfillmentService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const stockTracked = await service.fulfillPackagePayment(tx as never, {
      id: 'pay-1',
      userId: 'user-1',
      sourceId: 'up-1',
      metadata: null,
    });

    expect(userPackageUpdate).toHaveBeenCalledWith({
      where: { id: 'up-1' },
      data: expect.objectContaining({ status: UserPackageStatus.ACTIVE }),
    });
    expect(stockTracked).toBe(true);
    expect(tx.payment.update).toHaveBeenCalled();
    expect(tx.packagePlan.updateMany).toHaveBeenCalled();
  });

  it('reactivates a reverted package without decrementing stock again', async () => {
    const packagePlanUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
    const paymentCreate = jest.fn();
    const tx = {
      userPackage: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'up-1',
          status: UserPackageStatus.PENDING,
          planId: 'plan-1',
          createdAt: new Date('2026-09-01T00:00:00.000Z'),
          plan: { startDate: null, name: 'Reformer', currency: 'amd' },
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      payment: {
        update: jest.fn(),
        create: paymentCreate,
      },
      packagePlan: {
        updateMany: packagePlanUpdateMany,
      },
    };
    const service = new PaymentsFulfillmentService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const stockTracked = await service.fulfillPackagePayment(tx as never, {
      id: 'pay-1',
      userId: 'user-1',
      sourceId: 'up-1',
      metadata: { studioPackageFulfilled: true, giftCreditsAppliedCents: 5_000 },
    });

    expect(tx.userPackage.update).toHaveBeenCalledWith({
      where: { id: 'up-1' },
      data: expect.objectContaining({ status: UserPackageStatus.ACTIVE }),
    });
    expect(stockTracked).toBe(false);
    expect(packagePlanUpdateMany).not.toHaveBeenCalled();
    expect(paymentCreate).not.toHaveBeenCalled();
  });
});
