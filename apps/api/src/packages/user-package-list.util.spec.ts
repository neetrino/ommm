import { UserPackageStatus } from '@prisma/client';
import {
  buildVisibleUserPackagesWhere,
  compareUserPackagesForClientList,
} from './user-package-list.util';

describe('user-package-list.util', () => {
  it('shows only packages with a succeeded payment', () => {
    const where = buildVisibleUserPackagesWhere('user-1', ['paid-pkg']);
    expect(where).toEqual({
      userId: 'user-1',
      id: { in: ['paid-pkg'] },
      status: {
        in: [
          UserPackageStatus.ACTIVE,
          UserPackageStatus.PAUSED,
          UserPackageStatus.EXPIRED,
          UserPackageStatus.CANCELLED,
        ],
      },
    });
  });

  it('hides everything when there are no succeeded package payments', () => {
    const where = buildVisibleUserPackagesWhere('user-1', []);
    expect(where).toEqual({
      userId: 'user-1',
      id: { in: [] },
      status: {
        in: [
          UserPackageStatus.ACTIVE,
          UserPackageStatus.PAUSED,
          UserPackageStatus.EXPIRED,
          UserPackageStatus.CANCELLED,
        ],
      },
    });
  });

  it('sorts active before cancelled, then newer first', () => {
    const olderActive = {
      status: UserPackageStatus.ACTIVE,
      createdAt: new Date('2026-01-01'),
    };
    const newerCancelled = {
      status: UserPackageStatus.CANCELLED,
      createdAt: new Date('2026-06-01'),
    };
    const newerActive = {
      status: UserPackageStatus.ACTIVE,
      createdAt: new Date('2026-03-01'),
    };
    const rows = [newerCancelled, olderActive, newerActive];
    rows.sort(compareUserPackagesForClientList);
    expect(rows[0]).toBe(newerActive);
    expect(rows[1]).toBe(olderActive);
    expect(rows[2]).toBe(newerCancelled);
  });
});
