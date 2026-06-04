import { durationMonthsToPeriodDays } from "@/components/admin/admin-package-form-utils";
import { normalizePackageCategoryKey } from "@/components/admin/package-category-utils";
import { resolvePublicPackageTierSessionCount } from "@/components/marketing/packages/public-package-tier-display";
import { listConfiguredPublicPackagePlans } from "@/lib/public-package-categories";
import type { PublicPackagePlan } from "@/lib/public-package-plan";

/** Spreadsheet: Ommm Pilates → Reformer Individual (AMD stored in `priceCents`). */
export const REFORMER_INDIVIDUAL_TIER_KEYS = [
  "welcome-1st-class",
  1,
  8,
  16,
] as const;

export type ReformerIndividualTierKey = (typeof REFORMER_INDIVIDUAL_TIER_KEYS)[number];

const REFORMER_INDIVIDUAL_FALLBACK_PLAN_ID_PREFIX = "marketing-reformer-individual-tier-";

type ReformerIndividualCanonicalTier = {
  key: ReformerIndividualTierKey;
  name: string;
  sessionsPerMonth: number;
  priceCents: number;
  periodDays: number;
  guestCount: number;
  displayOrder: number;
};

const REFORMER_INDIVIDUAL_CANONICAL_TIERS: readonly ReformerIndividualCanonicalTier[] = [
  {
    key: "welcome-1st-class",
    name: "Welcome 1st Class",
    sessionsPerMonth: 1,
    priceCents: 20_000,
    periodDays: 40,
    guestCount: 1,
    displayOrder: 0,
  },
  {
    key: 1,
    name: "1 Session",
    sessionsPerMonth: 1,
    priceCents: 30_000,
    periodDays: 60,
    guestCount: 2,
    displayOrder: 1,
  },
  {
    key: 8,
    name: "8 Sessions",
    sessionsPerMonth: 8,
    priceCents: 216_000,
    periodDays: 90,
    guestCount: 3,
    displayOrder: 2,
  },
  {
    key: 16,
    name: "16 Sessions",
    sessionsPerMonth: 16,
    priceCents: 384_000,
    periodDays: durationMonthsToPeriodDays(6),
    guestCount: 6,
    displayOrder: 3,
  },
];

const REFORMER_INDIVIDUAL_CANONICAL_BY_KEY = Object.fromEntries(
  REFORMER_INDIVIDUAL_CANONICAL_TIERS.map((tier) => [tier.key, tier]),
) as Record<ReformerIndividualTierKey, ReformerIndividualCanonicalTier>;

function buildFallbackPlanId(key: ReformerIndividualTierKey): string {
  return `${REFORMER_INDIVIDUAL_FALLBACK_PLAN_ID_PREFIX}${String(key)}`;
}

function buildCanonicalReformerIndividualPlan(
  tier: ReformerIndividualCanonicalTier,
): PublicPackagePlan {
  return {
    id: buildFallbackPlanId(tier.key),
    name: tier.name,
    categoryName: "Reformer Individual",
    description: null,
    priceCents: tier.priceCents,
    currency: "AMD",
    billingPeriod: "one_time",
    periodDays: tier.periodDays,
    sessionsPerMonth: tier.sessionsPerMonth,
    isUnlimited: false,
    isPopular: false,
    isActive: true,
    features: [],
    guestCount: tier.guestCount,
    displayOrder: tier.displayOrder,
  };
}

export function isMarketingReformerIndividualFallbackPlan(
  plan: Pick<PublicPackagePlan, "id">,
): boolean {
  return plan.id.startsWith(REFORMER_INDIVIDUAL_FALLBACK_PLAN_ID_PREFIX);
}

function isWelcomeReformerIndividualPlanName(name: string): boolean {
  return normalizePackageCategoryKey(name).includes("welcome");
}

function mergeReformerIndividualPlanWithCanonical(
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

function findApiPlanForReformerIndividualTier(
  configured: readonly PublicPackagePlan[],
  tierKey: ReformerIndividualTierKey,
): PublicPackagePlan | undefined {
  if (tierKey === "welcome-1st-class") {
    return configured.find(
      (plan) =>
        typeof plan.name === "string" && isWelcomeReformerIndividualPlanName(plan.name),
    );
  }

  return configured.find((plan) => {
    if (plan.isUnlimited) {
      return false;
    }
    if (typeof plan.name === "string" && isWelcomeReformerIndividualPlanName(plan.name)) {
      return false;
    }
    return resolvePublicPackageTierSessionCount(plan) === tierKey;
  });
}

/** Reformer Individual tiers for marketing UI — canonical spreadsheet pricing. */
export function listReformerIndividualCategoryDisplayPlans(
  plans: readonly PublicPackagePlan[],
): PublicPackagePlan[] {
  const configured = listConfiguredPublicPackagePlans(plans);

  return REFORMER_INDIVIDUAL_TIER_KEYS.map((tierKey) => {
    const tier = REFORMER_INDIVIDUAL_CANONICAL_BY_KEY[tierKey];
    const canonical = buildCanonicalReformerIndividualPlan(tier);
    const apiPlan = findApiPlanForReformerIndividualTier(configured, tierKey);
    if (apiPlan !== undefined) {
      return mergeReformerIndividualPlanWithCanonical(apiPlan, canonical);
    }
    return canonical;
  });
}

export function listReformerIndividualSubscribablePlans(
  plans: readonly PublicPackagePlan[],
): PublicPackagePlan[] {
  return listReformerIndividualCategoryDisplayPlans(plans).filter(
    (plan) => !isMarketingReformerIndividualFallbackPlan(plan),
  );
}
