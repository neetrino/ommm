import {
  ManualPaymentMethod,
  PaymentStatus,
  UserPackageStatus,
} from '@prisma/client';
import {
  buildVisibleUserPackagesWhere,
  compareUserPackagesForClientList,
  loadSucceededPackageSourceIds,
} from './user-package-list.util';

describe('user-package-list.util', () => {
  it('shows paid packages and unpaid studio-pending packages', () => {
    const where = buildVisibleUserPackagesWhere('user-1', ['paid-pkg']);
    expect(where).toEqual({
      userId: 'user-1',
      id: { in: ['paid-pkg'] },
      status: {
        in: [
          UserPackageStatus.PENDING,
          UserPackageStatus.ACTIVE,
          UserPackageStatus.PAUSED,
          UserPackageStatus.EXPIRED,
          UserPackageStatus.CANCELLED,
        ],
      },
    });
  });

  it('hides everything when there are no visible package payments', () => {
    const where = buildVisibleUserPackagesWhere('user-1', []);
    expect(where).toEqual({
      userId: 'user-1',
      id: { in: [] },
      status: {
        in: [
          UserPackageStatus.PENDING,
          UserPackageStatus.ACTIVE,
          UserPackageStatus.PAUSED,
          UserPackageStatus.EXPIRED,
          UserPackageStatus.CANCELLED,
        ],
      },
    });
  });

  it('includes unpaid cash packages and hides pending card checkouts', async () => {
    const ids = await loadSucceededPackageSourceIds(
      {
        payment: {
          findMany: jest.fn().mockResolvedValue([
            {
              sourceId: 'paid',
              status: PaymentStatus.SUCCEEDED,
              paymentMethod: ManualPaymentMethod.CARD,
            },
            {
              sourceId: 'unpaid-cash',
              status: PaymentStatus.PENDING,
              paymentMethod: ManualPaymentMethod.CASH,
            },
            {
              sourceId: 'unpaid-terminal',
              status: PaymentStatus.PENDING,
              paymentMethod: ManualPaymentMethod.CARD_TERMINAL,
            },
            {
              sourceId: 'card-checkout',
              status: PaymentStatus.PENDING,
              paymentMethod: ManualPaymentMethod.CARD,
            },
          ]),
        },
      },
      'user-1',
    );
    expect(ids).toEqual(['paid', 'unpaid-cash', 'unpaid-terminal']);
  });

  it('sorts unpaid pending before active, then newer first', () => {
    const unpaidPending = {
      status: UserPackageStatus.PENDING,
      createdAt: new Date('2026-01-01'),
    };
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
    const rows = [newerCancelled, olderActive, unpaidPending, newerActive];
    rows.sort(compareUserPackagesForClientList);
    expect(rows[0]).toBe(unpaidPending);
    expect(rows[1]).toBe(newerActive);
    expect(rows[2]).toBe(olderActive);
    expect(rows[3]).toBe(newerCancelled);
  });
});
