import { UserPackageStatus } from '@prisma/client';
import {
  pickClientActivePackage,
  toClientActivePackageFields,
  type ClientActivePackageCandidate,
} from './clients-row-active-package';

function makePackage(
  overrides: Partial<ClientActivePackageCandidate> &
    Pick<ClientActivePackageCandidate, 'id' | 'status' | 'currentPeriodEnd'>,
): ClientActivePackageCandidate {
  return {
    plan: {
      id: 'plan-1',
      name: 'Reformer 8',
      categoryName: 'Reformer',
      priceCents: 450_000,
      periodDays: 30,
      isUnlimited: false,
      sessionsPerMonth: 8,
    },
    sourcePlanIdSnapshot: 'plan-1',
    planNameSnapshot: 'Reformer 8 snapshot',
    planCategoryNameSnapshot: 'Reformer',
    planPriceCentsSnapshot: 400_000,
    planPeriodDaysSnapshot: 30,
    planIsUnlimitedSnapshot: false,
    planSessionsPerMonthSnapshot: 8,
    freezeAllowedCountSnapshot: 0,
    freezeMaxDaysPerUseSnapshot: 0,
    ...overrides,
  };
}

describe('pickClientActivePackage', () => {
  const nowMs = Date.parse('2026-07-28T12:00:00.000Z');

  it('prefers ACTIVE over PENDING when both are in period', () => {
    const pending = makePackage({
      id: 'pkg-pending',
      status: UserPackageStatus.PENDING,
      currentPeriodEnd: new Date('2026-08-20T00:00:00.000Z'),
    });
    const active = makePackage({
      id: 'pkg-active',
      status: UserPackageStatus.ACTIVE,
      currentPeriodEnd: new Date('2026-08-10T00:00:00.000Z'),
      plan: {
        id: 'plan-2',
        name: 'Yoga Unlimited',
        categoryName: 'Yoga',
        priceCents: 600_000,
        periodDays: 30,
        isUnlimited: true,
        sessionsPerMonth: null,
      },
    });

    expect(pickClientActivePackage([pending, active], nowMs)?.id).toBe(
      'pkg-active',
    );
  });

  it('prefers in-period packages over expired ones', () => {
    const expired = makePackage({
      id: 'pkg-expired',
      status: UserPackageStatus.ACTIVE,
      currentPeriodEnd: new Date('2026-06-01T00:00:00.000Z'),
    });
    const current = makePackage({
      id: 'pkg-current',
      status: UserPackageStatus.PAUSED,
      currentPeriodEnd: new Date('2026-08-15T00:00:00.000Z'),
    });

    expect(pickClientActivePackage([expired, current], nowMs)?.id).toBe(
      'pkg-current',
    );
  });

  it('returns null when there are no candidates', () => {
    expect(pickClientActivePackage([], nowMs)).toBeNull();
  });
});

describe('toClientActivePackageFields', () => {
  it('maps plan name, cost, and date-only expiration', () => {
    const fields = toClientActivePackageFields([
      makePackage({
        id: 'pkg-1',
        status: UserPackageStatus.ACTIVE,
        currentPeriodEnd: new Date('2026-08-15T18:30:00.000Z'),
      }),
    ]);

    expect(fields).toEqual({
      activePlanName: 'Reformer 8',
      activePlanCostCents: 450_000,
      activePlanExpiresAt: '2026-08-15',
      activePackageId: 'pkg-1',
      activePackageStatus: UserPackageStatus.ACTIVE,
    });
  });

  it('returns null fields when no package is selected', () => {
    expect(toClientActivePackageFields([])).toEqual({
      activePlanName: null,
      activePlanCostCents: null,
      activePlanExpiresAt: null,
      activePackageId: null,
      activePackageStatus: null,
    });
  });
});
