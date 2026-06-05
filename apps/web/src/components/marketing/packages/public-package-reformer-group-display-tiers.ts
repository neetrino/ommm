import { durationMonthsToPeriodDays } from "@/components/admin/admin-package-form-utils";
import { resolvePublicPackageTierSessionCount } from "@/components/marketing/packages/public-package-tier-display";
import { listConfiguredPublicPackagePlans } from "@/lib/public-package-categories";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

/** Spreadsheet: Ommm Pilates → Reformer Group (AMD stored in `priceCents`). */
export const REFORMER_GROUP_CANONICAL_SESSION_COUNTS = [1, 8, 16, 24, 48] as const;

/** Public `/packages` — single Reformer tier until more are published. */
export const REFORMER_MARKETING_SESSION_COUNTS = [1] as const;

const REFORMER_GROUP_FALLBACK_PLAN_ID_PREFIX = "marketing-reformer-group-tier-";

type ReformerCanonicalTier = {
  sessions: (typeof REFORMER_GROUP_CANONICAL_SESSION_COUNTS)[number];
  priceCents: number;
  periodDays: number;
  guestCount: number;
};

const REFORMER_GROUP_CANONICAL_TIERS: readonly ReformerCanonicalTier[] = [
  { sessions: 1, priceCents: 15_000, periodDays: 0, guestCount: 0 },
  { sessions: 8, priceCents: 105_000, periodDays: 40, guestCount: 1 },
  { sessions: 16, priceCents: 170_000, periodDays: 60, guestCount: 2 },
  { sessions: 24, priceCents: 216_000, periodDays: 90, guestCount: 3 },
  {
    sessions: 48,
    priceCents: 408_000,
    periodDays: durationMonthsToPeriodDays(6),
    guestCount: 6,
  },
];

function buildCanonicalReformerPlan(tier: ReformerCanonicalTier): PublicPackagePlan {
  const sessionLabel = tier.sessions === 1 ? "1 Session" : `${tier.sessions} Sessions`;
  return {
    id: `${REFORMER_GROUP_FALLBACK_PLAN_ID_PREFIX}${tier.sessions}-sessions`,
    name: sessionLabel,
    categoryName: "Reformer Group",
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
    guestCount: tier.guestCount,
    displayOrder: tier.sessions,
  };
}

const REFORMER_GROUP_CANONICAL_BY_SESSIONS = Object.fromEntries(
  REFORMER_GROUP_CANONICAL_TIERS.map((tier) => [
    tier.sessions,
    buildCanonicalReformerPlan(tier),
  ]),
) as Record<
  (typeof REFORMER_GROUP_CANONICAL_SESSION_COUNTS)[number],
  PublicPackagePlan
>;

export function isMarketingReformerGroupFallbackPlan(
  plan: Pick<PublicPackagePlan, "id">,
): boolean {
  return plan.id.startsWith(REFORMER_GROUP_FALLBACK_PLAN_ID_PREFIX);
}

function mergeReformerPlanWithCanonical(
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

/** Reformer Group tiers for marketing UI — canonical spreadsheet pricing. */
export function listReformerGroupCategoryDisplayPlans(
  plans: readonly PublicPackagePlan[],
): PublicPackagePlan[] {
  return listReformerCategoryDisplayPlansForSessions(
    plans,
    REFORMER_GROUP_CANONICAL_SESSION_COUNTS,
  );
}

/** Public `/packages` Reformer card — one tier for now. */
export function listReformerMarketingDisplayPlans(
  plans: readonly PublicPackagePlan[],
): PublicPackagePlan[] {
  return listReformerCategoryDisplayPlansForSessions(
    plans,
    REFORMER_MARKETING_SESSION_COUNTS,
  );
}

function listReformerCategoryDisplayPlansForSessions(
  plans: readonly PublicPackagePlan[],
  sessionCounts: readonly number[],
): PublicPackagePlan[] {
  const configured = listConfiguredPublicPackagePlans(plans);

  return sessionCounts.map((sessionCount) => {
    const canonical =
      REFORMER_GROUP_CANONICAL_BY_SESSIONS[
        sessionCount as (typeof REFORMER_GROUP_CANONICAL_SESSION_COUNTS)[number]
      ];
    const apiPlan = configured.find(
      (plan) =>
        !plan.isUnlimited && resolvePublicPackageTierSessionCount(plan) === sessionCount,
    );
    if (apiPlan !== undefined) {
      return mergeReformerPlanWithCanonical(apiPlan, canonical);
    }
    return { ...canonical };
  });
}

export function listReformerGroupSubscribablePlans(
  plans: readonly PublicPackagePlan[],
): PublicPackagePlan[] {
  return listReformerGroupCategoryDisplayPlans(plans).filter(
    (plan) => !isMarketingReformerGroupFallbackPlan(plan),
  );
}
