import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PackagesService } from './packages.service';

function createPackagesService() {
  const prisma = {
    packagePlan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const packageUsage = {
    syncExpiredMemberships: jest.fn(),
    reconcileSessionsRemaining: jest.fn(),
  };

  return {
    service: new PackagesService(prisma as never, packageUsage as never),
    prisma,
  };
}

describe('PackagesService', () => {
  it('throws when updating a missing plan', async () => {
    const { service, prisma } = createPackagesService();
    prisma.packagePlan.findUnique.mockResolvedValue(null);

    await expect(service.updatePlan('missing', {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects a discounted price that is not below the full price', async () => {
    const { service, prisma } = createPackagesService();
    prisma.packagePlan.findUnique.mockResolvedValue({
      id: 'plan-1',
      slug: 'plan-1',
      priceCents: 10000,
      discountedPriceCents: null,
    });

    await expect(
      service.updatePlan('plan-1', { discountedPriceCents: 10000 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
