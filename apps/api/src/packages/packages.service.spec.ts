import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PackagesAdminService } from './packages-admin.service';
import { PackagesPublicService } from './packages-public.service';
import { PackagesService } from './packages.service';

function createPackagesService() {
  const prisma = {
    packagePlan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const packageUsage = {
    syncExpiredMemberships: jest.fn(),
    reconcileSessionsRemaining: jest.fn(),
  };

  const cache = {
    invalidate: jest.fn(),
    getOrSet: jest.fn(),
  };

  const config = {
    get: jest.fn(),
  };

  const publicService = new PackagesPublicService(
    prisma as never,
    config as never,
    cache as never,
  );
  const adminService = new PackagesAdminService(
    prisma as never,
    publicService,
    packageUsage as never,
  );
  const service = new PackagesService(publicService, adminService);

  return {
    service,
    prisma,
    cache,
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

  it('deletes a plan even when active memberships exist', async () => {
    const { service, prisma, cache } = createPackagesService();
    prisma.packagePlan.findUnique.mockResolvedValue({ id: 'plan-1' });
    prisma.packagePlan.delete.mockResolvedValue({ id: 'plan-1' });
    cache.invalidate.mockResolvedValue(undefined);

    await expect(service.deletePlan('plan-1')).resolves.toEqual({ ok: true });

    expect(prisma.packagePlan.delete).toHaveBeenCalledWith({
      where: { id: 'plan-1' },
    });
    expect(cache.invalidate).toHaveBeenCalled();
  });
});
