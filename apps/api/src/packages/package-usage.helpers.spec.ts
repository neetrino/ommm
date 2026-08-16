import {
  hasAnyBookableCredit,
  isUserPackageActiveAt,
  membershipCoversSessionType,
  pickBalanceForCategory,
  type UserPackageWithPlanAndBalances,
} from './package-usage.helpers';

function createMembership(params: {
  balances: UserPackageWithPlanAndBalances['balances'];
  periodStart?: Date;
  periodEnd?: Date;
}): UserPackageWithPlanAndBalances {
  const now = new Date('2026-07-25T12:00:00.000Z');
  return {
    id: 'user-package-1',
    userId: 'user-1',
    planId: 'plan-1',
    sourcePlanIdSnapshot: 'plan-1',
    planNameSnapshot: 'Pack',
    planCategoryNameSnapshot: 'Reformer',
    planPriceCentsSnapshot: 12000,
    planPeriodDaysSnapshot: 40,
    planIsUnlimitedSnapshot: false,
    planSessionsPerMonthSnapshot: 8,
    status: 'ACTIVE',
    currentPeriodStart: params.periodStart ?? now,
    currentPeriodEnd: params.periodEnd ?? new Date('2026-09-10T00:00:00.000Z'),
    sessionsTotal: 8,
    sessionsRemaining: 8,
    createdAt: now,
    updatedAt: now,
    plan: {
      id: 'plan-1',
      name: 'Pack',
      categoryName: 'Reformer',
      isUnlimited: false,
    },
    balances: params.balances,
  };
}

describe('package-usage.helpers classType matching', () => {
  it('still matches credits after catalog archive because eligibility uses classTypeId', () => {
    const membership = createMembership({
      balances: [
        {
          id: 'balance-1',
          classTypeId: 'ct-evening-yoga',
          sourceCategoryNameSnapshot: 'Evening Yoga by Ommm',
          sessionsTotal: 1,
          sessionsUsed: 0,
          sessionsRemaining: 1,
          isUnlimited: false,
        },
      ],
    });
    const sessionClassType = {
      id: 'ct-evening-yoga',
      name: 'Evening Yoga by Ommm',
    };

    expect(membershipCoversSessionType(membership, sessionClassType)).toBe(
      true,
    );
    expect(hasAnyBookableCredit(membership, sessionClassType)).toBe(true);
  });

  it('matches by classTypeId even when names diverge', () => {
    const membership = createMembership({
      balances: [
        {
          id: 'balance-1',
          classTypeId: 'ct-reformer-group',
          sourceCategoryNameSnapshot: 'Reformer',
          sessionsTotal: 2,
          sessionsUsed: 0,
          sessionsRemaining: 2,
          isUnlimited: false,
        },
      ],
    });
    const classType = { id: 'ct-reformer-group', name: 'Reformer Group' };

    expect(membershipCoversSessionType(membership, classType)).toBe(true);
    expect(hasAnyBookableCredit(membership, classType)).toBe(true);
    expect(pickBalanceForCategory(membership, classType)?.id).toBe('balance-1');
  });

  it('does not match renamed class type by name when ids differ', () => {
    const membership = createMembership({
      balances: [
        {
          id: 'balance-1',
          classTypeId: 'ct-old-reformer',
          sourceCategoryNameSnapshot: 'Reformer',
          sessionsTotal: 2,
          sessionsUsed: 0,
          sessionsRemaining: 2,
          isUnlimited: false,
        },
      ],
    });
    const classType = { id: 'ct-new-reformer-group', name: 'Reformer Group' };

    expect(membershipCoversSessionType(membership, classType)).toBe(false);
    expect(pickBalanceForCategory(membership, classType)).toBeNull();
  });

  it('falls back to name when classTypeId is null', () => {
    const membership = createMembership({
      balances: [
        {
          id: 'balance-1',
          classTypeId: null,
          sourceCategoryNameSnapshot: 'Mat Pilates',
          sessionsTotal: 2,
          sessionsUsed: 0,
          sessionsRemaining: 2,
          isUnlimited: false,
        },
      ],
    });
    const classType = { id: 'ct-mat', name: 'Mat Pilates' };

    expect(membershipCoversSessionType(membership, classType)).toBe(true);
    expect(pickBalanceForCategory(membership, classType)?.id).toBe('balance-1');
  });
});

describe('package-usage.helpers period vs session date', () => {
  it('is active for a future session inside the package window', () => {
    const membership = createMembership({
      balances: [],
      periodStart: new Date('2026-08-01T00:00:00.000Z'),
      periodEnd: new Date('2026-09-10T00:00:00.000Z'),
    });
    const sessionAt = new Date('2026-08-10T08:00:00.000Z');

    expect(isUserPackageActiveAt(membership, sessionAt)).toBe(true);
    expect(
      isUserPackageActiveAt(membership, new Date('2026-07-25T12:00:00.000Z')),
    ).toBe(false);
  });
});
