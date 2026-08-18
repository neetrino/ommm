export type UserPackagePlanSnapshotInput = {
  id: string;
  name: string;
  categoryName: string;
  priceCents: number;
  periodDays: number;
  isUnlimited: boolean;
  sessionsPerMonth: number | null;
  freezeAllowedCount?: number;
  freezeMaxDaysPerUse?: number;
};

export type UserPackagePlanSnapshotFields = {
  sourcePlanIdSnapshot: string;
  planNameSnapshot: string;
  planCategoryNameSnapshot: string;
  planPriceCentsSnapshot: number;
  planPeriodDaysSnapshot: number;
  planIsUnlimitedSnapshot: boolean;
  planSessionsPerMonthSnapshot: number | null;
  freezeAllowedCountSnapshot: number;
  freezeMaxDaysPerUseSnapshot: number;
};

export type ResolvedUserPackagePlan = {
  id: string;
  name: string;
  categoryName: string;
  priceCents: number;
  periodDays: number;
  isUnlimited: boolean;
  sessionsPerMonth: number | null;
};

export function buildUserPackagePlanSnapshot(
  plan: UserPackagePlanSnapshotInput,
): UserPackagePlanSnapshotFields {
  return {
    sourcePlanIdSnapshot: plan.id,
    planNameSnapshot: plan.name,
    planCategoryNameSnapshot: plan.categoryName,
    planPriceCentsSnapshot: plan.priceCents,
    planPeriodDaysSnapshot: plan.periodDays,
    planIsUnlimitedSnapshot: plan.isUnlimited,
    planSessionsPerMonthSnapshot: plan.sessionsPerMonth,
    freezeAllowedCountSnapshot: plan.freezeAllowedCount ?? 0,
    freezeMaxDaysPerUseSnapshot: plan.freezeMaxDaysPerUse ?? 0,
  };
}

export function resolveUserPackagePlan(params: {
  plan: UserPackagePlanSnapshotInput | null;
  snapshots: UserPackagePlanSnapshotFields;
}): ResolvedUserPackagePlan {
  if (params.plan !== null) {
    return {
      id: params.plan.id,
      name: params.plan.name,
      categoryName: params.plan.categoryName,
      priceCents: params.plan.priceCents,
      periodDays: params.plan.periodDays,
      isUnlimited: params.plan.isUnlimited,
      sessionsPerMonth: params.plan.sessionsPerMonth,
    };
  }

  return {
    id: params.snapshots.sourcePlanIdSnapshot,
    name: params.snapshots.planNameSnapshot,
    categoryName: params.snapshots.planCategoryNameSnapshot,
    priceCents: params.snapshots.planPriceCentsSnapshot,
    periodDays: params.snapshots.planPeriodDaysSnapshot,
    isUnlimited: params.snapshots.planIsUnlimitedSnapshot,
    sessionsPerMonth: params.snapshots.planSessionsPerMonthSnapshot,
  };
}

export function resolveUserPackagePlanIsUnlimited(params: {
  plan: { isUnlimited: boolean } | null;
  planIsUnlimitedSnapshot: boolean;
}): boolean {
  return params.plan?.isUnlimited ?? params.planIsUnlimitedSnapshot;
}

export function resolveUserPackagePlanCategoryName(params: {
  plan: { categoryName: string } | null;
  planCategoryNameSnapshot: string;
  balances: readonly { sourceCategoryNameSnapshot: string }[];
}): string {
  if (params.balances.length > 1) {
    return params.balances[0]?.sourceCategoryNameSnapshot.trim() ?? '';
  }
  if (params.balances.length === 1) {
    const balanceCategory =
      params.balances[0]?.sourceCategoryNameSnapshot.trim();
    if (balanceCategory !== undefined && balanceCategory.length > 0) {
      return balanceCategory;
    }
  }
  return params.plan?.categoryName ?? params.planCategoryNameSnapshot;
}
