import {
  buildUserPackagePlanSnapshot,
  resolveUserPackagePlan,
  resolveUserPackagePlanCategoryName,
  resolveUserPackagePlanIsUnlimited,
} from './user-package-plan-snapshot.util';

describe('user-package-plan-snapshot.util', () => {
  const plan = {
    id: 'plan-1',
    name: 'Reformer Pack',
    categoryName: 'Reformer',
    priceCents: 25000,
    periodDays: 30,
    isUnlimited: false,
    sessionsPerMonth: 8,
  };

  it('builds snapshot fields from a live plan', () => {
    expect(buildUserPackagePlanSnapshot(plan)).toEqual({
      sourcePlanIdSnapshot: 'plan-1',
      planNameSnapshot: 'Reformer Pack',
      planCategoryNameSnapshot: 'Reformer',
      planPriceCentsSnapshot: 25000,
      planPeriodDaysSnapshot: 30,
      planIsUnlimitedSnapshot: false,
      planSessionsPerMonthSnapshot: 8,
    });
  });

  it('prefers live plan data when the catalog plan still exists', () => {
    expect(
      resolveUserPackagePlan({
        plan,
        snapshots: buildUserPackagePlanSnapshot({
          ...plan,
          name: 'Legacy name',
        }),
      }),
    ).toEqual({
      id: 'plan-1',
      name: 'Reformer Pack',
      categoryName: 'Reformer',
      priceCents: 25000,
      periodDays: 30,
      isUnlimited: false,
      sessionsPerMonth: 8,
    });
  });

  it('falls back to snapshots when the catalog plan was deleted', () => {
    const snapshots = buildUserPackagePlanSnapshot(plan);
    expect(
      resolveUserPackagePlan({
        plan: null,
        snapshots,
      }),
    ).toEqual({
      id: 'plan-1',
      name: 'Reformer Pack',
      categoryName: 'Reformer',
      priceCents: 25000,
      periodDays: 30,
      isUnlimited: false,
      sessionsPerMonth: 8,
    });
  });

  it('resolves unlimited and category coverage from snapshots', () => {
    const snapshots = buildUserPackagePlanSnapshot({
      ...plan,
      isUnlimited: true,
      categoryName: 'Legacy Category',
    });
    expect(
      resolveUserPackagePlanIsUnlimited({
        plan: null,
        planIsUnlimitedSnapshot: snapshots.planIsUnlimitedSnapshot,
      }),
    ).toBe(true);
    expect(
      resolveUserPackagePlanCategoryName({
        plan: null,
        planCategoryNameSnapshot: snapshots.planCategoryNameSnapshot,
        balances: [
          { sourceCategoryNameSnapshot: 'Reformer' },
        ],
      }),
    ).toBe('Reformer');
  });
});
