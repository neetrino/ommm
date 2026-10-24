import { PackageBookIntentService } from './package-book-intent.service';

function createHarness() {
  const prisma = {
    payment: {
      findFirst: jest.fn().mockResolvedValue({
        status: 'SUCCEEDED',
        sourceId: 'purchased-package',
        metadata: { bookSessionId: 'session-1' },
      }),
    },
    classSession: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'session-1',
        title: 'Reformer',
        startsAt: new Date('2099-10-27T15:00:00Z'),
        endsAt: new Date('2099-10-27T16:00:00Z'),
        capacity: 10,
        status: 'SCHEDULED',
        classType: { id: 'type-1', name: 'Reformer' },
        coach: { user: { name: 'Coach', lastName: null } },
      }),
    },
    booking: { findUnique: jest.fn().mockResolvedValue(null) },
  };
  const packages = { listEligibleUserPackages: jest.fn() };
  const service = new PackageBookIntentService(
    prisma as never,
    packages as never,
    { bookedCount: jest.fn().mockResolvedValue(0) } as never,
  );
  return { service, prisma, packages };
}

describe('PackageBookIntentService', () => {
  it('returns the purchased package for the confirmation button when several packages cover the class', async () => {
    const { service, packages } = createHarness();
    packages.listEligibleUserPackages.mockResolvedValue([
      { userPackageId: 'other-package', canBook: true },
      { userPackageId: 'purchased-package', canBook: true },
    ]);

    await expect(service.read('user-1', 'reference')).resolves.toMatchObject({
      status: 'ready',
      userPackageId: 'purchased-package',
      session: { id: 'session-1' },
    });
  });

  it('does not offer booking with an exhausted purchased package even if another package has credit', async () => {
    const { service, packages } = createHarness();
    packages.listEligibleUserPackages.mockResolvedValue([
      { userPackageId: 'other-package', canBook: true },
      { userPackageId: 'purchased-package', canBook: false },
    ]);

    await expect(service.read('user-1', 'reference')).resolves.toMatchObject({
      status: 'not_covered',
    });
  });

  it('does not offer booking while the package payment is pending', async () => {
    const { service, prisma, packages } = createHarness();
    prisma.payment.findFirst.mockResolvedValue({
      status: 'PENDING',
      sourceId: 'purchased-package',
      metadata: { bookSessionId: 'session-1' },
    });

    await expect(service.read('user-1', 'reference')).resolves.toMatchObject({
      status: 'pending_payment',
    });
    expect(packages.listEligibleUserPackages).not.toHaveBeenCalled();
  });

  it('does not treat an exhausted package as ready for legacy payments without a package id', async () => {
    const { service, prisma, packages } = createHarness();
    prisma.payment.findFirst.mockResolvedValue({
      status: 'SUCCEEDED',
      sourceId: null,
      metadata: { bookSessionId: 'session-1' },
    });
    packages.listEligibleUserPackages.mockResolvedValue([
      { userPackageId: 'package-1', canBook: false },
    ]);

    await expect(service.read('user-1', 'reference')).resolves.toMatchObject({
      status: 'not_covered',
    });
  });
});
