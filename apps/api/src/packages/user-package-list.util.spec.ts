import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { UserPackageStatus } from '@prisma/client';
import {
  buildVisibleUserPackagesWhere,
  compareUserPackagesForClientList,
} from './user-package-list.util';
import {
  readPackagePlanIdFromMetadata,
  withPackagePlanIdMetadata,
} from './package-payment-metadata.util';

describe('package-payment-metadata.util', () => {
  it('stores and reads planId on payment metadata', () => {
    const metadata = withPackagePlanIdMetadata(null, 'plan-1', {
      statusReason: 'checkout_not_started',
    });
    assert.equal(readPackagePlanIdFromMetadata(metadata), 'plan-1');
  });
});

describe('user-package-list.util', () => {
  it('hides pending and unpaid cancelled packages', () => {
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
    assert.equal(rows[0], newerActive);
    assert.equal(rows[1], olderActive);
    assert.equal(rows[2], newerCancelled);
  });
});
