import { PackageUsageEligibilityService } from './package-usage-eligibility.service';

jest.mock('./packages-freeze.resume', () => ({
  resumeDueFreezes: jest.fn().mockResolvedValue(undefined),
}));

describe('PackageUsageEligibilityService', () => {
  it('loads only ACTIVE packages so unpaid PENDING studio packages cannot book', async () => {
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

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'user-1',
          status: 'ACTIVE',
        }),
      }),
    );
  });
});
