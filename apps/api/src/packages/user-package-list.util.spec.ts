import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { UserPackageStatus } from '@prisma/client';
import {
  buildVisibleUserPackagesWhere,
  compareUserPackagesForClientList,
} from './user-package-list.util';

void describe('user-package-list.util', () => {
  void it('hides pending and unpaid cancelled packages', () => {
    const where = buildVisibleUserPackagesWhere('user-1', ['paid-pkg']);
    assert.deepEqual(where, {
      userId: 'user-1',
      OR: [
        {
          status: {
            in: [
              UserPackageStatus.ACTIVE,
              UserPackageStatus.PAUSED,
              UserPackageStatus.EXPIRED,
            ],
          },
        },
        {
          status: UserPackageStatus.CANCELLED,
          id: { in: ['paid-pkg'] },
        },
      ],
    });
  });

  void it('sorts active before cancelled, then newer first', () => {
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
    assert.equal(rows[0], newerActive);
    assert.equal(rows[1], olderActive);
    assert.equal(rows[2], newerCancelled);
  });
});
