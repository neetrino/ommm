import { BadRequestException } from '@nestjs/common';
import { PackagePlanType } from '@prisma/client';
import { PackageUsageService } from './package-usage.service';

type MockTx = {
  userPackageBalance: { update: jest.Mock };
  userPackage: { update: jest.Mock };
  bookingConsumption: {
    create: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
  };
};

function createServiceWithPrismaMock() {
  const prisma = {
    userPackage: {
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };
  return {
    prisma,
    service: new PackageUsageService(prisma as never),
  };
}

function createMembership(params?: {
  id?: string;
  planType?: PackagePlanType;
  categoryName?: string;
  remaining?: number | null;
  balanceRemaining?: number | null;
  isUnlimited?: boolean;
}) {
  const now = new Date();
  const id = params?.id ?? 'user-package-1';
  const categoryName = params?.categoryName ?? 'Reformer';
  const remaining = params?.remaining ?? 5;
  const balanceRemaining = params?.balanceRemaining ?? remaining;
  const isUnlimited = params?.isUnlimited ?? false;
  return {
    id,
    userId: 'user-1',
    planId: 'plan-1',
    status: 'ACTIVE',
    currentPeriodStart: now,
    currentPeriodEnd: new Date(now.getTime() + 86_400_000),
    sessionsTotal: isUnlimited ? null : 8,
    sessionsRemaining: isUnlimited ? null : remaining,
    createdAt: now,
    updatedAt: now,
    cancelledAt: null,
    pausedUntil: null,
    pausedAt: null,
    plan: {
      id: 'plan-1',
      name: 'Reformer Pack',
      planType: params?.planType ?? PackagePlanType.SINGLE,
      categoryName,
      isUnlimited,
    },
    balances: [
      {
        id: 'balance-1',
        sourceCategoryNameSnapshot: categoryName,
        sessionsTotal: isUnlimited ? null : 8,
        sessionsUsed: isUnlimited ? 0 : 3,
        sessionsRemaining: isUnlimited ? null : balanceRemaining,
        isUnlimited,
      },
    ],
  };
}

describe('PackageUsageService', () => {
  it('lists eligible packages with canBook=false for depleted balances', async () => {
    const { prisma, service } = createServiceWithPrismaMock();
    prisma.userPackage.findMany.mockResolvedValue([
      createMembership({ remaining: 0, balanceRemaining: 0 }),
    ]);

    const rows = await service.listEligibleUserPackages({
      userId: 'user-1',
      session: {
        id: 'session-1',
        classType: { id: 'type-1', name: 'Reformer' },
      },
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]?.canBook).toBe(false);
    expect(rows[0]?.includedCategories).toEqual(['Reformer']);
  });

  it('throws when explicit package is not bookable', async () => {
    const { service } = createServiceWithPrismaMock();
    const tx = {
      userPackage: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            createMembership({ remaining: 0, balanceRemaining: 0 }),
          ]),
      },
    };

    await expect(
      service.getValidatedUserPackageForBooking({
        tx: tx as never,
        userId: 'user-1',
        userPackageId: 'user-package-1',
        session: {
          id: 'session-1',
          classType: { id: 'type-1', name: 'Reformer' },
        },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('consumes session credits for limited package', async () => {
    const { service } = createServiceWithPrismaMock();
    const tx: MockTx = {
      userPackageBalance: { update: jest.fn() },
      userPackage: { update: jest.fn() },
      bookingConsumption: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    await service.consumeSession({
      tx: tx as never,
      bookingId: 'booking-1',
      membership: createMembership() as never,
      sessionCategoryName: 'Reformer',
      requiredSessions: 1,
    });

    expect(tx.userPackageBalance.update).toHaveBeenCalledTimes(1);
    expect(tx.userPackage.update).toHaveBeenCalledTimes(1);
    expect(tx.bookingConsumption.create).toHaveBeenCalledTimes(1);
  });

  it('restores consumed sessions and marks rows restored', async () => {
    const { service } = createServiceWithPrismaMock();
    const tx: MockTx = {
      userPackageBalance: { update: jest.fn() },
      userPackage: { update: jest.fn() },
      bookingConsumption: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'consumption-1',
            userPackageId: 'user-package-1',
            userPackageBalanceId: 'balance-1',
            consumedSessions: 2,
          },
        ]),
        update: jest.fn(),
      },
    };

    await service.restoreSession({
      tx: tx as never,
      bookingId: 'booking-1',
    });

    expect(tx.userPackageBalance.update).toHaveBeenCalledTimes(1);
    expect(tx.userPackage.update).toHaveBeenCalledTimes(1);
    expect(tx.bookingConsumption.update).toHaveBeenCalledTimes(1);
  });

  it('reconciles sessionsRemaining from component balances', async () => {
    const { prisma, service } = createServiceWithPrismaMock();
    prisma.userPackage.findMany.mockResolvedValue([
      {
        id: 'finite-membership',
        balances: [
          { sessionsRemaining: 2, isUnlimited: false },
          { sessionsRemaining: 3, isUnlimited: false },
        ],
      },
      {
        id: 'unlimited-membership',
        balances: [{ sessionsRemaining: null, isUnlimited: true }],
      },
    ]);

    await service.reconcileSessionsRemaining();

    expect(prisma.userPackage.update).toHaveBeenCalledWith({
      where: { id: 'finite-membership' },
      data: { sessionsRemaining: 5 },
    });
    expect(prisma.userPackage.update).toHaveBeenCalledWith({
      where: { id: 'unlimited-membership' },
      data: { sessionsRemaining: null },
    });
  });
});
