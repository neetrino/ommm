import { SIX_MONTH_PERIOD_DAYS } from "./constants";

export type PackagePlanSeed = {
  slug: string;
  name: string;
  categoryName: string;
  description: string;
  priceCents: number;
  sessionsPerMonth: number;
  periodDays: number;
  guestCount: number;
  displayOrder: number;
  isPopular?: boolean;
  features: string[];
  buttonLabel?: string;
};

type TierDef = {
  slugSuffix: string;
  name: string;
  sessions: number;
  priceCents: number;
  periodDays: number;
  guestCount: number;
  displayOrder: number;
  isPopular?: boolean;
};

function sessionName(count: number): string {
  return count === 1 ? "1 Session" : `${count} Sessions`;
}

function buildCategoryPlans(
  categorySlug: string,
  categoryName: string,
  tagline: string,
  features: readonly string[],
  tiers: readonly TierDef[],
): PackagePlanSeed[] {
  return tiers.map((tier) => ({
    slug: `${categorySlug}-${tier.slugSuffix}`,
    name: tier.name,
    categoryName,
    description: `${tagline} — ${tier.name}.`,
    priceCents: tier.priceCents,
    sessionsPerMonth: tier.sessions,
    periodDays: tier.periodDays,
    guestCount: tier.guestCount,
    displayOrder: tier.displayOrder,
    isPopular: tier.isPopular,
    features: [...features],
    buttonLabel: tier.sessions === 1 ? "Try one class" : "Choose plan",
  }));
}

const YOGA_TIERS: readonly TierDef[] = [
  { slugSuffix: "1-session", name: "1 Session", sessions: 1, priceCents: 9_000, periodDays: 0, guestCount: 0, displayOrder: 1 },
  { slugSuffix: "4-sessions", name: "4 Sessions", sessions: 4, priceCents: 28_000, periodDays: 20, guestCount: 0, displayOrder: 2 },
  { slugSuffix: "8-sessions", name: "8 Sessions", sessions: 8, priceCents: 50_000, periodDays: 40, guestCount: 0, displayOrder: 3, isPopular: true },
  { slugSuffix: "16-sessions", name: "16 Sessions", sessions: 16, priceCents: 88_000, periodDays: 90, guestCount: 0, displayOrder: 4 },
  { slugSuffix: "24-sessions", name: "24 Sessions", sessions: 24, priceCents: 120_000, periodDays: 120, guestCount: 0, displayOrder: 5 },
];

const REFORMER_GROUP_TIERS: readonly TierDef[] = [
  { slugSuffix: "1-session", name: "1 Session", sessions: 1, priceCents: 15_000, periodDays: 0, guestCount: 0, displayOrder: 1 },
  { slugSuffix: "8-sessions", name: "8 Sessions", sessions: 8, priceCents: 105_000, periodDays: 40, guestCount: 1, displayOrder: 2 },
  { slugSuffix: "16-sessions", name: "16 Sessions", sessions: 16, priceCents: 170_000, periodDays: 60, guestCount: 2, displayOrder: 3, isPopular: true },
  { slugSuffix: "24-sessions", name: "24 Sessions", sessions: 24, priceCents: 216_000, periodDays: 90, guestCount: 3, displayOrder: 4 },
  { slugSuffix: "48-sessions", name: "48 Sessions", sessions: 48, priceCents: 408_000, periodDays: SIX_MONTH_PERIOD_DAYS, guestCount: 6, displayOrder: 5 },
];

const REFORMER_INDIVIDUAL_TIERS: readonly TierDef[] = [
  { slugSuffix: "welcome-1st-class", name: "Welcome 1st Class", sessions: 1, priceCents: 20_000, periodDays: 40, guestCount: 1, displayOrder: 0 },
  { slugSuffix: "1-session", name: "1 Session", sessions: 1, priceCents: 30_000, periodDays: 60, guestCount: 2, displayOrder: 1 },
  { slugSuffix: "8-sessions", name: "8 Sessions", sessions: 8, priceCents: 216_000, periodDays: 90, guestCount: 3, displayOrder: 2, isPopular: true },
  { slugSuffix: "16-sessions", name: "16 Sessions", sessions: 16, priceCents: 384_000, periodDays: SIX_MONTH_PERIOD_DAYS, guestCount: 6, displayOrder: 3 },
  { slugSuffix: "24-sessions", name: "24 Sessions", sessions: 24, priceCents: 480_000, periodDays: SIX_MONTH_PERIOD_DAYS, guestCount: 6, displayOrder: 4 },
];

const MAT_PILATES_TIERS: readonly TierDef[] = [
  { slugSuffix: "1-session", name: "1 Session", sessions: 1, priceCents: 9_000, periodDays: 0, guestCount: 0, displayOrder: 1 },
  { slugSuffix: "4-sessions", name: "4 Sessions", sessions: 4, priceCents: 35_000, periodDays: 14, guestCount: 0, displayOrder: 2 },
  { slugSuffix: "8-sessions", name: "8 Sessions", sessions: 8, priceCents: 62_000, periodDays: 21, guestCount: 0, displayOrder: 3 },
  { slugSuffix: "12-sessions", name: "12 Sessions", sessions: 12, priceCents: 88_000, periodDays: 30, guestCount: 0, displayOrder: 4, isPopular: true },
  { slugSuffix: "16-sessions", name: "16 Sessions", sessions: 16, priceCents: 110_000, periodDays: 45, guestCount: 0, displayOrder: 5 },
];

const DANCES_TIERS: readonly TierDef[] = [
  { slugSuffix: "1-session", name: "1 Session", sessions: 1, priceCents: 9_000, periodDays: 0, guestCount: 1, displayOrder: 1 },
  { slugSuffix: "4-sessions", name: "4 Sessions", sessions: 4, priceCents: 35_000, periodDays: 14, guestCount: 1, displayOrder: 2 },
  { slugSuffix: "8-sessions", name: "8 Sessions", sessions: 8, priceCents: 62_000, periodDays: 21, guestCount: 0, displayOrder: 3 },
  { slugSuffix: "12-sessions", name: "12 Sessions", sessions: 12, priceCents: 88_000, periodDays: 30, guestCount: 0, displayOrder: 4, isPopular: true },
  { slugSuffix: "16-sessions", name: "16 Sessions", sessions: 16, priceCents: 110_000, periodDays: 45, guestCount: 0, displayOrder: 5 },
];

/** 5 categories × 5 session tiers = 25 public package plans. */
export const PACKAGE_PLAN_SEEDS: readonly PackagePlanSeed[] = [
  ...buildCategoryPlans("yoga", "Yoga", "Breath-led yoga flow", ["Mindful flow", "Certified instructors", "Flexible validity"], YOGA_TIERS),
  ...buildCategoryPlans("reformer-group", "Reformer Group", "Small-group reformer energy", ["Progressive programming", "Community sessions", "Guest passes"], REFORMER_GROUP_TIERS),
  ...buildCategoryPlans("reformer-individual", "Reformer Individual", "Private reformer coaching", ["Personal attention", "Posture coaching", "Guest passes"], REFORMER_INDIVIDUAL_TIERS),
  ...buildCategoryPlans("mat-pilates", "Mat Pilates", "Core-centered mat work", ["All levels welcome", "Compact classes", "Breath-led core"], MAT_PILATES_TIERS),
  ...buildCategoryPlans("dances", "Dances", "Expressive studio dance", ["Rhythm and mobility", "Weekly playlists", "Joyful movement"], DANCES_TIERS),
];
