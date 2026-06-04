import { resolvePublicPackageTierSessionCount } from "@/components/marketing/packages/public-package-tier-display";
import { listConfiguredPublicPackagePlans } from "@/lib/public-package-categories";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

/** Canonical Dances pricing (spreadsheet / Figma). Stored as whole AMD in `priceCents`. */
export const DANCES_TIER_1_SESSION_PRICE_CENTS = 9_000;
export const DANCES_TIER_12_SESSION_PRICE_CENTS = 88_000;
export const DANCES_TIER_12_SESSION_PERIOD_DAYS = 30;

const DANCES_CANONICAL_SESSION_COUNTS = [1, 12] as const;
const DANCES_FALLBACK_PLAN_ID_PREFIX = "marketing-dances-tier-";

const DANCES_CANONICAL_1_SESSION: PublicPackagePlan = {
  id: `${DANCES_FALLBACK_PLAN_ID_PREFIX}1-session`,
  name: "1 Session",
  categoryName: "Dances",
  description: null,
  priceCents: DANCES_TIER_1_SESSION_PRICE_CENTS,
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

const DANCES_CANONICAL_12_SESSIONS: PublicPackagePlan = {
  id: `${DANCES_FALLBACK_PLAN_ID_PREFIX}12-sessions`,
  name: "12 Sessions",
  categoryName: "Dances",
  description: null,
  priceCents: DANCES_TIER_12_SESSION_PRICE_CENTS,
  currency: "AMD",
  billingPeriod: "one_time",
  periodDays: DANCES_TIER_12_SESSION_PERIOD_DAYS,
  sessionsPerMonth: 12,
  isUnlimited: false,
  isPopular: false,
  isActive: true,
  features: [],
  guestCount: 0,
  displayOrder: 2,
};

const DANCES_CANONICAL_BY_SESSIONS: Record<
  (typeof DANCES_CANONICAL_SESSION_COUNTS)[number],
  PublicPackagePlan
> = {
  1: DANCES_CANONICAL_1_SESSION,
  12: DANCES_CANONICAL_12_SESSIONS,
};

/** Display-only tiers until configured in Admin → Packages. */
export function isMarketingDancesFallbackPlan(
  plan: Pick<PublicPackagePlan, "id">,
): boolean {
  return plan.id.startsWith(DANCES_FALLBACK_PLAN_ID_PREFIX);
}

function mergeDancesPlanWithCanonical(
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
    guestCount: apiPlan.guestCount ?? 0,
  };
}

/**
 * Dances tiers for marketing UI — always 1 + 12 sessions with canonical prices.
 * Keeps real API plan `id` when present (subscribe / deep links).
 */
export function listDancesCategoryDisplayPlans(
  plans: readonly PublicPackagePlan[],
): PublicPackagePlan[] {
  const configured = listConfiguredPublicPackagePlans(plans);

  return DANCES_CANONICAL_SESSION_COUNTS.map((sessionCount) => {
    const canonical = DANCES_CANONICAL_BY_SESSIONS[sessionCount];
    const apiPlan = configured.find(
      (plan) =>
        !plan.isUnlimited && resolvePublicPackageTierSessionCount(plan) === sessionCount,
    );
    if (apiPlan !== undefined) {
      return mergeDancesPlanWithCanonical(apiPlan, canonical);
    }
    return { ...canonical };
  });
}

/** Plans safe for subscribe modal (real DB tiers only). */
export function listDancesSubscribablePlans(
  plans: readonly PublicPackagePlan[],
): PublicPackagePlan[] {
  return listDancesCategoryDisplayPlans(plans).filter((plan) => !isMarketingDancesFallbackPlan(plan));
}
