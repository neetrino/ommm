import { PackageUsageEligibilityService } from './package-usage-eligibility.service';

jest.mock('./packages-freeze.resume', () => ({
  resumeDueFreezes: jest.fn().mockResolvedValue(undefined),
}));

describe('PackageUsageEligibilityService', () => {
  it('loads only ACTIVE packages so unpaid checkout PENDING packages cannot book', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const service = new PackageUsageEligibilityService({
      userPackage: { findMany },
    } as never);

    await service.listCoveringUserPackages({
      userId: 'user-1',
      session: {
        id: 'session-1',
        startsAt: new Date('2026-09-10T10:00:00.000Z'),
        classType: { id: 'type-1', name: 'Reformer' },
      },
    });

    const findManyArgs = findMany.mock.calls[0] as
      | [{ where: { userId: string; status: string; removedAt: null } }]
      | undefined;
    expect(findManyArgs?.[0].where).toMatchObject({
      userId: 'user-1',
      status: 'ACTIVE',
      removedAt: null,
    });
  });
});
