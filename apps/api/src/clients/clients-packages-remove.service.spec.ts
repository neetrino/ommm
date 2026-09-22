import { NotFoundException } from '@nestjs/common';
import { Role, UserPackageStatus, type User } from '@prisma/client';
import { ClientsPackagesRemoveService } from './clients-packages-remove.service';

function createActor(): User {
  return { id: 'manager-1', role: Role.MANAGER } as User;
}

function createService() {
  const freezeUpdateMany = jest.fn().mockResolvedValue({ count: 0 });
  const packageUpdate = jest.fn().mockResolvedValue({ id: 'pkg-1' });
  const tx = {
    userPackageFreeze: { updateMany: freezeUpdateMany },
    userPackage: { update: packageUpdate },
    booking: { deleteMany: jest.fn() },
    bookingConsumption: { deleteMany: jest.fn() },
  };
  const prisma = {
    user: { findFirst: jest.fn().mockResolvedValue({ id: 'client-1' }) },
    userPackage: {
      findFirst: jest.fn().mockResolvedValue({
        id: 'pkg-1',
        status: UserPackageStatus.ACTIVE,
        planNameSnapshot: 'Reformer 8',
      }),
    },
    $transaction: jest.fn(async (fn: (client: typeof tx) => Promise<void>) =>
      fn(tx),
    ),
  };
  const audit = { log: jest.fn().mockResolvedValue(undefined) };
  const service = new ClientsPackagesRemoveService(
    prisma as never,
    audit as never,
  );
  return { service, prisma, tx, audit };
}

describe('ClientsPackagesRemoveService', () => {
  it('hides the package and leaves bookings untouched', async () => {
    const { service, tx, audit } = createService();

    const result = await service.remove(createActor(), 'client-1', 'pkg-1');

    expect(result.id).toBe('pkg-1');
    expect(tx.userPackage.update).toHaveBeenCalledWith({
      where: { id: 'pkg-1' },
      data: expect.objectContaining({
        status: UserPackageStatus.CANCELLED,
        removedByUserId: 'manager-1',
        pausedAt: null,
        pausedUntil: null,
      }),
    });
    expect(tx.booking.deleteMany).not.toHaveBeenCalled();
    expect(tx.bookingConsumption.deleteMany).not.toHaveBeenCalled();
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CLIENT_PACKAGE_REMOVED' }),
    );
  });

  it('rejects a missing client', async () => {
    const { service, prisma } = createService();
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(
      service.remove(createActor(), 'missing', 'pkg-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects a package that is already gone', async () => {
    const { service, prisma } = createService();
    prisma.userPackage.findFirst.mockResolvedValue(null);

    await expect(
      service.remove(createActor(), 'client-1', 'pkg-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
