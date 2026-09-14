import { UserPackageStatus } from '@prisma/client';
import { PaymentsFulfillmentService } from './payments-fulfillment.service';

describe('PaymentsFulfillmentService package confirm', () => {
  it('activates a PENDING studio package when payment is fulfilled', async () => {
    const userPackageUpdate = jest.fn(
      (args: {
        where: { id: string };
        data: { status: UserPackageStatus };
      }) => {
        void args;
        return Promise.resolve({});
      },
    );
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

    expect(userPackageUpdate.mock.calls[0]?.[0].where).toEqual({ id: 'up-1' });
    expect(userPackageUpdate.mock.calls[0]?.[0].data.status).toBe(
      UserPackageStatus.ACTIVE,
    );
    expect(stockTracked).toBe(true);
    expect(tx.payment.update).toHaveBeenCalled();
    expect(tx.packagePlan.updateMany).toHaveBeenCalled();
  });

  it('reactivates a reverted package without decrementing stock again', async () => {
    const userPackageUpdate = jest.fn(
      (args: {
        where: { id: string };
        data: { status: UserPackageStatus };
      }) => {
        void args;
        return Promise.resolve({});
      },
    );
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
        update: userPackageUpdate,
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
      metadata: {
        studioPackageFulfilled: true,
        giftCreditsAppliedCents: 5_000,
      },
    });

    expect(userPackageUpdate.mock.calls[0]?.[0].where).toEqual({ id: 'up-1' });
    expect(userPackageUpdate.mock.calls[0]?.[0].data.status).toBe(
      UserPackageStatus.ACTIVE,
    );
    expect(stockTracked).toBe(false);
    expect(packagePlanUpdateMany).not.toHaveBeenCalled();
    expect(paymentCreate).not.toHaveBeenCalled();
  });

  it('does not decrement stock again when the studio package is already ACTIVE', async () => {
    const userPackageUpdate = jest.fn();
    const packagePlanUpdateMany = jest.fn();
    const tx = {
      userPackage: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'up-1',
          status: UserPackageStatus.ACTIVE,
          planId: 'plan-1',
          createdAt: new Date('2026-09-01T00:00:00.000Z'),
          plan: { startDate: null, name: 'Reformer', currency: 'amd' },
        }),
        update: userPackageUpdate,
      },
      payment: {
        update: jest.fn(),
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
      metadata: { studioPackageFulfilled: true },
    });

    expect(stockTracked).toBe(false);
    expect(userPackageUpdate).not.toHaveBeenCalled();
    expect(packagePlanUpdateMany).not.toHaveBeenCalled();
  });
});
