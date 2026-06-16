import { resolvePublicPackageTierSessionCount } from "@/components/marketing/packages/public-package-tier-display";
import { listConfiguredPublicPackagePlans } from "@/lib/public-package-categories";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

/** Canonical Yoga pricing (spreadsheet). Stored as whole AMD in `priceCents`. */
export const YOGA_CANONICAL_SESSION_COUNTS = [1, 8, 16] as const;

const YOGA_FALLBACK_PLAN_ID_PREFIX = "marketing-yoga-tier-";

type YogaCanonicalTier = {
  sessions: (typeof YOGA_CANONICAL_SESSION_COUNTS)[number];
  priceCents: number;
  periodDays: number;
};

const YOGA_CANONICAL_TIERS: readonly YogaCanonicalTier[] = [
  { sessions: 1, priceCents: 9_000, periodDays: 0 },
  { sessions: 8, priceCents: 50_000, periodDays: 40 },
  { sessions: 16, priceCents: 88_000, periodDays: 90 },
];

function buildCanonicalYogaPlan(tier: YogaCanonicalTier): PublicPackagePlan {
  const sessionLabel = tier.sessions === 1 ? "1 Session" : `${tier.sessions} Sessions`;
  return {
    id: `${YOGA_FALLBACK_PLAN_ID_PREFIX}${tier.sessions}-sessions`,
    name: sessionLabel,
    categoryName: "Yoga",
    description: null,
    priceCents: tier.priceCents,
    currency: "AMD",
    billingPeriod: "one_time",
    periodDays: tier.periodDays,
    sessionsPerMonth: tier.sessions,
    isUnlimited: false,
    isPopular: false,
    isActive: true,
    features: [],
    guestCount: 0,
    displayOrder: tier.sessions,
  };
}

const YOGA_CANONICAL_BY_SESSIONS = Object.fromEntries(
  YOGA_CANONICAL_TIERS.map((tier) => [tier.sessions, buildCanonicalYogaPlan(tier)]),
) as Record<(typeof YOGA_CANONICAL_SESSION_COUNTS)[number], PublicPackagePlan>;

export function isMarketingYogaFallbackPlan(plan: Pick<PublicPackagePlan, "id">): boolean {
  return plan.id.startsWith(YOGA_FALLBACK_PLAN_ID_PREFIX);
}

function mergeYogaPlanWithCanonical(
  apiPlan: PublicPackagePlan,
  canonical: PublicPackagePlan,
): PublicPackagePlan {
  return {
    ...apiPlan,
    priceCents: canonical.priceCents,
    sessionsPerMonth: canonical.sessionsPerMonth,
    periodDays: canonical.periodDays,
    billingPeriod: canonical.billingPeriod,
    guestCount: canonical.guestCount,
  };
}

/** Yoga tiers for marketing UI — canonical spreadsheet pricing. */
export function listYogaCategoryDisplayPlans(
  plans: readonly PublicPackagePlan[],
): PublicPackagePlan[] {
  const configured = listConfiguredPublicPackagePlans(plans);

  return YOGA_CANONICAL_SESSION_COUNTS.map((sessionCount) => {
    const canonical = YOGA_CANONICAL_BY_SESSIONS[sessionCount];
    const apiPlan = configured.find(
      (plan) =>
        !plan.isUnlimited && resolvePublicPackageTierSessionCount(plan) === sessionCount,
    );
    if (apiPlan !== undefined) {
      return mergeYogaPlanWithCanonical(apiPlan, canonical);
    }
    return { ...canonical };
  });
}

export function listYogaSubscribablePlans(plans: readonly PublicPackagePlan[]): PublicPackagePlan[] {
  return listYogaCategoryDisplayPlans(plans).filter(
    (plan) => !isMarketingYogaFallbackPlan(plan),
  );
}
