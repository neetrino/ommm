import { NotFoundException } from '@nestjs/common';
import { PaymentSource, PaymentStatus, Role } from '@prisma/client';
import { PackagesAdminClientPurchaseService } from './packages-admin-client-purchase.service';

function createPlan() {
  return {
    id: 'plan-1',
    name: 'Reformer 8',
    slug: 'reformer-8',
    categoryName: 'Reformer',
    categorySlug: 'reformer',
    classTypeId: null,
    description: null,
    isActive: true,
    priceCents: 120_000,
    discountedPriceCents: null,
    pricePerSessionCents: 15_000,
    showPricePerSession: true,
    currency: 'AMD',
    billingPeriod: 'monthly',
    periodDays: 30,
    startDate: null,
    sessionsPerMonth: 8,
    isUnlimited: false,
    guestCount: 0,
    freezeAllowedCount: 0,
    freezeMaxDaysPerUse: 0,
    availableQuantity: 5,
    typeSessionAllocations: [],
  };
}

describe('PackagesAdminClientPurchaseService', () => {
  it('grants an influencer package immediately and stores catalog price as cost', async () => {
    const plan = createPlan();
    const paymentCreate = jest.fn((args: { data: Record<string, unknown> }) => {
      void args;
      return Promise.resolve({
        id: 'pay-1',
        amountCents: 120_000,
        currency: 'amd',
      });
    });
    const userPackageCreate = jest.fn(
      (args: { data: Record<string, unknown> }) => {
        void args;
        return Promise.resolve({ id: 'up-1' });
      },
    );
    const tx = {
      userPackage: {
        create: userPackageCreate,
      },
      payment: { create: paymentCreate },
      userPackageBalance: {
        create: jest.fn().mockResolvedValue({ id: 'bal-1' }),
      },
      packagePlan: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest.fn(),
      },
    };
    const prisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue({ id: 'client-1' }),
      },
      packagePlan: {
        findUnique: jest.fn().mockResolvedValue(plan),
      },
      $transaction: jest.fn(
        async (callback: (client: typeof tx) => Promise<unknown>) =>
          callback(tx),
      ),
    };
    const publicPackages = {
      invalidatePublicPlansCache: jest.fn().mockResolvedValue(undefined),
    };
    const service = new PackagesAdminClientPurchaseService(
      prisma as never,
      publicPackages as never,
      { tryNotify: jest.fn().mockResolvedValue(undefined) } as never,
    );

    const result = await service.purchase({
      adminId: 'admin-1',
      clientId: 'client-1',
      planId: 'plan-1',
      paymentMethod: 'INFLUENCER',
    });

    expect(result).toMatchObject({
      userPackageId: 'up-1',
      paymentId: 'pay-1',
      planId: 'plan-1',
      paymentMethod: 'INFLUENCER',
      amountCents: 120_000,
    });
    expect(paymentCreate.mock.calls[0]?.[0].data).toMatchObject({
      userId: 'client-1',
      amountCents: 120_000,
      status: PaymentStatus.SUCCEEDED,
      source: PaymentSource.PACKAGE,
      sourceId: 'up-1',
      confirmedByAdminId: 'admin-1',
      paymentMethod: 'INFLUENCER',
    });
    expect(userPackageCreate.mock.calls[0]?.[0].data).toMatchObject({
      userId: 'client-1',
      planId: 'plan-1',
      status: 'ACTIVE',
    });
    expect(publicPackages.invalidatePublicPlansCache).toHaveBeenCalled();
  });

  it('rejects a missing client', async () => {
    const prisma = {
      user: { findFirst: jest.fn().mockResolvedValue(null) },
      packagePlan: { findUnique: jest.fn() },
      $transaction: jest.fn(),
    };
    const service = new PackagesAdminClientPurchaseService(
      prisma as never,
      { invalidatePublicPlansCache: jest.fn() } as never,
      { tryNotify: jest.fn() } as never,
    );

    await expect(
      service.purchase({
        adminId: 'admin-1',
        clientId: 'missing',
        planId: 'plan-1',
        paymentMethod: 'CASH',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: 'missing', role: Role.USER },
      select: { id: true },
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
