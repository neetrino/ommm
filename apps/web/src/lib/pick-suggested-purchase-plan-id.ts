type PurchasePlanIdShape = {
  id: string;
};

type EligiblePackagePlanShape = {
  planId: string;
  canBook: boolean;
};

/**
 * Picks a default plan for the booking purchase modal.
 * Only considers plans already filtered to cover the session class type.
 * Prefers the plan behind a depleted eligible package; otherwise the first plan.
 * Returns undefined when there is nothing to suggest.
 */
export function pickSuggestedPurchasePlanId(
  packages: readonly EligiblePackagePlanShape[],
  plans: readonly PurchasePlanIdShape[],
): string | undefined {
  if (plans.length === 0) {
    return undefined;
  }

  const planIds = new Set(plans.map((plan) => plan.id));
  const depletedMatch = packages.find(
    (pkg) => !pkg.canBook && planIds.has(pkg.planId),
  );
  if (depletedMatch !== undefined) {
    return depletedMatch.planId;
  }

  return plans[0]?.id;
}
