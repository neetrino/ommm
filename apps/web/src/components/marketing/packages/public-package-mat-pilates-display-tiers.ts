import { resolvePublicPackageTierSessionCount } from "@/components/marketing/packages/public-package-tier-display";
import { listConfiguredPublicPackagePlans } from "@/lib/public-package-categories";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

/** Canonical Mat Pilates pricing (spreadsheet). Stored as whole AMD in `priceCents`. */
export const MAT_PILATES_TIER_1_SESSION_PRICE_CENTS = 9_000;
export const MAT_PILATES_TIER_12_SESSION_PRICE_CENTS = 88_000;
export const MAT_PILATES_TIER_12_SESSION_PERIOD_DAYS = 30;

const MAT_PILATES_CANONICAL_SESSION_COUNTS = [1, 12] as const;
const MAT_PILATES_FALLBACK_PLAN_ID_PREFIX = "marketing-mat-pilates-tier-";

const MAT_PILATES_CANONICAL_1_SESSION: PublicPackagePlan = {
  id: `${MAT_PILATES_FALLBACK_PLAN_ID_PREFIX}1-session`,
  name: "1 Session",
  categoryName: "Mat Pilates",
  description: null,
  priceCents: MAT_PILATES_TIER_1_SESSION_PRICE_CENTS,
  currency: "AMD",
  billingPeriod: "one_time",
  periodDays: 0,
  sessionsPerMonth: 1,
  isUnlimited: false,
  isPopular: false,
  isActive: true,
  features: [],
  guestCount: 0,
  displayOrder: 1,
};

const MAT_PILATES_CANONICAL_12_SESSIONS: PublicPackagePlan = {
  id: `${MAT_PILATES_FALLBACK_PLAN_ID_PREFIX}12-sessions`,
  name: "12 Sessions",
  categoryName: "Mat Pilates",
  description: null,
  priceCents: MAT_PILATES_TIER_12_SESSION_PRICE_CENTS,
  currency: "AMD",
  billingPeriod: "one_time",
  periodDays: MAT_PILATES_TIER_12_SESSION_PERIOD_DAYS,
  sessionsPerMonth: 12,
  isUnlimited: false,
  isPopular: false,
  isActive: true,
  features: [],
  guestCount: 0,
  displayOrder: 2,
};

const MAT_PILATES_CANONICAL_BY_SESSIONS: Record<
  (typeof MAT_PILATES_CANONICAL_SESSION_COUNTS)[number],
  PublicPackagePlan
> = {
  1: MAT_PILATES_CANONICAL_1_SESSION,
  12: MAT_PILATES_CANONICAL_12_SESSIONS,
};

export function isMarketingMatPilatesFallbackPlan(
  plan: Pick<PublicPackagePlan, "id">,
): boolean {
  return plan.id.startsWith(MAT_PILATES_FALLBACK_PLAN_ID_PREFIX);
}

function mergeMatPilatesPlanWithCanonical(
  apiPlan: PublicPackagePlan,
  canonical: PublicPackagePlan,
): PublicPackagePlan {
  return {
    ...apiPlan,
    name: canonical.name,
    priceCents: canonical.priceCents,
    sessionsPerMonth: canonical.sessionsPerMonth,
    periodDays: canonical.periodDays,
    billingPeriod: canonical.billingPeriod,
    guestCount: canonical.guestCount,
  };
}

/** Mat Pilates tiers for marketing UI — always 1 + 12 sessions with canonical prices. */
export function listMatPilatesCategoryDisplayPlans(
  plans: readonly PublicPackagePlan[],
): PublicPackagePlan[] {
  const configured = listConfiguredPublicPackagePlans(plans);

  return MAT_PILATES_CANONICAL_SESSION_COUNTS.map((sessionCount) => {
    const canonical = MAT_PILATES_CANONICAL_BY_SESSIONS[sessionCount];
    const apiPlan = configured.find(
      (plan) =>
        !plan.isUnlimited && resolvePublicPackageTierSessionCount(plan) === sessionCount,
    );
    if (apiPlan !== undefined) {
      return mergeMatPilatesPlanWithCanonical(apiPlan, canonical);
    }
    return { ...canonical };
  });
}

export function listMatPilatesSubscribablePlans(
  plans: readonly PublicPackagePlan[],
): PublicPackagePlan[] {
  return listMatPilatesCategoryDisplayPlans(plans).filter(
    (plan) => !isMarketingMatPilatesFallbackPlan(plan),
  );
}
