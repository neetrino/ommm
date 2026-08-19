import { PaymentSource, PaymentStatus, Role } from '@prisma/client';
import {
  applyPackageSalesToClassTypes,
  matchClassTypeByName,
  rankPackageSales,
  rankTopClients,
  splitAmountByWeights,
} from './studio-analytics.rankings';
import type {
  StudioAnalyticsPackagePlanRow,
  StudioAnalyticsPaymentRow,
} from './studio-analytics.types';

function payment(
  overrides: Partial<StudioAnalyticsPaymentRow> = {},
): StudioAnalyticsPaymentRow {
  return {
    amountCents: 10_000,
    description: 'Membership',
    status: PaymentStatus.SUCCEEDED,
    createdAt: new Date('2026-06-01T10:00:00.000Z'),
    source: PaymentSource.PACKAGE,
    sourceId: 'pkg-1',
    paymentMethod: 'CARD',
    userId: 'user-1',
    userRole: Role.USER,
    userLabel: 'Client One',
    ...overrides,
  };
}

function plan(
  overrides: Partial<StudioAnalyticsPackagePlanRow> = {},
): StudioAnalyticsPackagePlanRow {
  return {
    userPackageId: 'pkg-1',
    planId: 'plan-1',
    planName: 'Mat Pilates Group 8',
    categoryName: 'Mat Pilates Group',
    classTypeId: 'type-group',
    typeSessionAllocations: [],
    ...overrides,
  };
}

describe('studio-analytics.rankings', () => {
  it('ranks package sales by plan and ignores non-package payments', () => {
    const ranked = rankPackageSales(
      [
        payment({ amountCents: 8_000, sourceId: 'pkg-1' }),
        payment({ amountCents: 12_000, sourceId: 'pkg-2' }),
        payment({
          amountCents: 4_000,
          source: PaymentSource.DROPIN,
          sourceId: 's1',
        }),
        payment({
          amountCents: 9_000,
          sourceId: 'pkg-3',
          status: PaymentStatus.PENDING,
        }),
      ],
      [
        plan({ userPackageId: 'pkg-1', planId: 'plan-a', planName: 'A' }),
        plan({ userPackageId: 'pkg-2', planId: 'plan-b', planName: 'B' }),
      ],
    );

    expect(ranked).toHaveLength(2);
    expect(ranked[0]).toMatchObject({
      id: 'plan-b',
      label: 'B',
      count: 1,
      amountCents: 12_000,
    });
    expect(ranked[1]).toMatchObject({ id: 'plan-a', amountCents: 8_000 });
  });

  it('ranks top USER clients and skips coaches', () => {
    const ranked = rankTopClients([
      payment({ userId: 'u1', userLabel: 'Ada', amountCents: 5_000 }),
      payment({ userId: 'u1', userLabel: 'Ada', amountCents: 7_000 }),
      payment({
        userId: 'coach-1',
        userRole: Role.COACH,
        userLabel: 'Coach',
        amountCents: 20_000,
      }),
    ]);

    expect(ranked).toHaveLength(1);
    expect(ranked[0]).toMatchObject({
      id: 'u1',
      label: 'Ada',
      amountCents: 12_000,
      paymentsCount: 2,
    });
  });

  it('splits package cash across typeSessionAllocations', () => {
    const buckets = new Map();
    applyPackageSalesToClassTypes(
      buckets,
      [payment({ amountCents: 10_000 })],
      [
        plan({
          classTypeId: null,
          typeSessionAllocations: [
            { classTypeId: 'type-a', sessionCount: 3 },
            { classTypeId: 'type-b', sessionCount: 1 },
          ],
        }),
      ],
      [
        { id: 'type-a', label: 'A' },
        { id: 'type-b', label: 'B' },
      ],
    );

    expect(buckets.get('type-a')?.amountCents).toBe(7_500);
    expect(buckets.get('type-b')?.amountCents).toBe(2_500);
  });

  it('matches class types by plan name when classTypeId is missing', () => {
    expect(
      matchClassTypeByName('Mat Pilates Group 8', [
        { id: 'type-group', label: 'Mat Pilates Group' },
        { id: 'type-ind', label: 'Mat Pilates Individual' },
      ])?.id,
    ).toBe('type-group');
  });

  it('puts leftover package cash in Unassigned when no class type maps', () => {
    const buckets = new Map();
    applyPackageSalesToClassTypes(
      buckets,
      [payment({ sourceId: 'missing-pkg', amountCents: 3_000 })],
      [],
      [],
    );

    expect(buckets.get('unassigned')).toMatchObject({
      label: 'Unassigned',
      amountCents: 3_000,
    });
  });

  it('filters package cash to the selected class type', () => {
    const buckets = new Map();
    applyPackageSalesToClassTypes(
      buckets,
      [payment({ amountCents: 10_000 })],
      [
        plan({
          classTypeId: null,
          typeSessionAllocations: [
            { classTypeId: 'type-a', sessionCount: 1 },
            { classTypeId: 'type-b', sessionCount: 1 },
          ],
        }),
      ],
      [
        { id: 'type-a', label: 'A' },
        { id: 'type-b', label: 'B' },
      ],
      'type-a',
    );

    expect(buckets.get('type-a')?.amountCents).toBe(5_000);
    expect(buckets.has('type-b')).toBe(false);
  });

  it('splitAmountByWeights keeps remainder on the last share', () => {
    expect(
      splitAmountByWeights(100, [
        { id: 'a', weight: 1 },
        { id: 'b', weight: 1 },
        { id: 'c', weight: 1 },
      ]),
    ).toEqual([
      { id: 'a', amountCents: 33 },
      { id: 'b', amountCents: 33 },
      { id: 'c', amountCents: 34 },
    ]);
  });
});
