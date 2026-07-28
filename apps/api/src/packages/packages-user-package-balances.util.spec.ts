import { BadRequestException } from '@nestjs/common';
import { createBalancesForUserPackage } from './packages-user-package-balances.util';

describe('createBalancesForUserPackage', () => {
  it('fails when a type allocation class type is missing', async () => {
    const tx = {
      classType: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'ct-live', name: 'Mat Pilates Group' }]),
      },
      userPackageBalance: {
        create: jest.fn(),
      },
    };

    await expect(
      createBalancesForUserPackage(tx as never, {
        userPackageId: 'up-1',
        plan: {
          id: 'plan-1',
          name: 'Your First Ommm.',
          categoryName: 'Your First Ommm.',
          classTypeId: null,
          isUnlimited: false,
          sessionsPerMonth: 8,
          typeSessionAllocations: [
            { classTypeId: 'ct-live', sessionCount: 2 },
            { classTypeId: 'ct-dead', sessionCount: 2 },
          ],
        } as never,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(tx.userPackageBalance.create).not.toHaveBeenCalled();
  });
});
