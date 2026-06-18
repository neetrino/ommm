import { BadRequestException } from '@nestjs/common';
import { PackagePlanType } from '@prisma/client';
import { PackagesService } from './packages.service';

function createPackagesService() {
  const tx = {
    packagePlan: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    combinedPlanComponent: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const prisma = {
    packagePlan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    combinedPlanComponent: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(
      async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
    ),
  };

  const packageUsage = {
    syncExpiredMemberships: jest.fn(),
    reconcileSessionsRemaining: jest.fn(),
  };

  return {
    service: new PackagesService(prisma as never, packageUsage as never),
    prisma,
    tx,
  };
}

describe('PackagesService', () => {
  it('rejects combined plan sources from duplicate categories', async () => {
    const { service, prisma } = createPackagesService();
    prisma.packagePlan.findMany.mockResolvedValue([
      { id: 'source-1', name: 'Yoga Basic', categoryName: 'Yoga' },
      { id: 'source-2', name: 'Yoga Plus', categoryName: ' yoga ' },
    ]);

    await expect(
      service.createCombinedPlan({
        name: 'Yoga Mix',
        sourcePlanIds: ['source-1', 'source-2'],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects unlimited combined plans at create time', async () => {
    const { service, prisma } = createPackagesService();
    prisma.packagePlan.findMany.mockResolvedValue([
      { id: 'source-1', name: 'Yoga Basic', categoryName: 'Yoga' },
      { id: 'source-2', name: 'Pilates Basic', categoryName: 'Pilates' },
    ]);

    await expect(
      service.createCombinedPlan({
        name: 'Yoga + Pilates',
        isUnlimited: true,
        sourcePlanIds: ['source-1', 'source-2'],
      }),
    ).rejects.toThrow('Combined plans cannot be unlimited');
  });

  it('rejects planType changes on update', async () => {
    const { service, prisma } = createPackagesService();
    prisma.packagePlan.findUnique.mockResolvedValue({
      id: 'plan-1',
      slug: 'combo-plan',
      planType: PackagePlanType.COMBINED,
      priceCents: 12000,
      discountedPriceCents: null,
    });

    await expect(
      service.updatePlan('plan-1', { planType: PackagePlanType.SINGLE }),
    ).rejects.toThrow('Plan type cannot be changed');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects direct sessionsPerMonth updates for combined plans', async () => {
    const { service, prisma } = createPackagesService();
    prisma.packagePlan.findUnique.mockResolvedValue({
      id: 'plan-1',
      slug: 'combo-plan',
      planType: PackagePlanType.COMBINED,
      priceCents: 12000,
      discountedPriceCents: null,
    });

    await expect(
      service.updatePlan('plan-1', { sessionsPerMonth: 20 }),
    ).rejects.toThrow(
      'Combined sessions must be updated via source allocations',
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('requires source allocations for every combined component', async () => {
    const { service, prisma, tx } = createPackagesService();
    prisma.packagePlan.findUnique.mockResolvedValue({
      id: 'plan-1',
      slug: 'combo-plan',
      planType: PackagePlanType.COMBINED,
      priceCents: 12000,
      discountedPriceCents: null,
    });
    tx.packagePlan.findUnique.mockResolvedValue({
      id: 'plan-1',
      planType: PackagePlanType.COMBINED,
    });
    tx.combinedPlanComponent.findMany.mockResolvedValue([
      { id: 'component-1' },
      { id: 'component-2' },
    ]);

    await expect(
      service.updatePlan('plan-1', {
        sourceSessionAllocations: [
          { componentId: 'component-1', sessionCount: 6 },
        ],
      }),
    ).rejects.toThrow(
      'Source allocations must include every combined component',
    );
    expect(tx.packagePlan.update).not.toHaveBeenCalled();
  });
});

