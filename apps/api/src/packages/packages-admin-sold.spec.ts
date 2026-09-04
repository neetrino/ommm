import { listSoldPackages } from './packages-admin-sold';
import { SOLD_PACKAGE_PAYMENTS_WHERE } from './packages-admin-stats';

describe('listSoldPackages', () => {
  it('lists succeeded package payments with buyer and plan name', async () => {
    const createdAt = new Date('2026-09-01T10:00:00.000Z');
    const prisma = {
      payment: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'pay-1',
            createdAt,
            amountCents: 25_000,
            currency: 'amd',
            sourceId: 'up-1',
            description: 'Package purchase',
            user: {
              id: 'user-1',
              name: 'Ani',
              lastName: 'K',
              email: 'ani@test.com',
            },
          },
        ]),
        count: jest.fn().mockResolvedValue(1),
      },
      userPackage: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'up-1',
            planNameSnapshot: 'Mix 8',
            plan: { name: 'Mix 8' },
          },
        ]),
      },
    };

    const result = await listSoldPackages(prisma as never, {
      take: 10,
      offset: 0,
    });

    expect(prisma.payment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { AND: [SOLD_PACKAGE_PAYMENTS_WHERE] },
        take: 10,
        skip: 0,
      }),
    );
    expect(result.total).toBe(1);
    expect(result.items).toEqual([
      {
        id: 'pay-1',
        createdAt,
        amountCents: 25_000,
        currency: 'amd',
        packageName: 'Mix 8',
        user: {
          id: 'user-1',
          name: 'Ani',
          lastName: 'K',
          email: 'ani@test.com',
        },
      },
    ]);
  });
});
