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

/** Five public tiers — one flagship plan per category for QA. */
export const PACKAGE_PLAN_SEEDS: readonly PackagePlanSeed[] = [
  {
    slug: "yoga-8-sessions",
    name: "8 Sessions",
    categoryName: "Yoga",
    description: "Eight grounded practices across forty days of calm momentum.",
    priceCents: 50_000,
    sessionsPerMonth: 8,
    periodDays: 40,
    guestCount: 0,
    displayOrder: 1,
    features: ["Mindful flow", "Certified instructors", "Flexible validity"],
    buttonLabel: "Start your rhythm",
  },
  {
    slug: "reformer-group-8-sessions",
    name: "8 Sessions",
    categoryName: "Reformer Group",
    description: "Eight energizing group sessions over forty days.",
    priceCents: 105_000,
    sessionsPerMonth: 8,
    periodDays: 40,
    guestCount: 1,
    displayOrder: 1,
    isPopular: true,
    features: ["Small-group energy", "Progressive programming", "Guest pass included"],
    buttonLabel: "Train with the group",
  },
  {
    slug: "reformer-individual-8-sessions",
    name: "8 Sessions",
    categoryName: "Reformer Individual",
    description: "Eight precision private sessions to sculpt posture and control.",
    priceCents: 216_000,
    sessionsPerMonth: 8,
    periodDays: 90,
    guestCount: 3,
    displayOrder: 1,
    features: ["Private attention", "Posture coaching", "Guest passes"],
    buttonLabel: "Build your foundation",
  },
  {
    slug: "mat-pilates-12-sessions",
    name: "12 Sessions",
    categoryName: "Mat Pilates",
    description: "Twelve mat sessions across thirty days of steady core work.",
    priceCents: 88_000,
    sessionsPerMonth: 12,
    periodDays: 30,
    guestCount: 0,
    displayOrder: 1,
    features: ["Core-focused mat work", "All levels welcome", "Compact classes"],
    buttonLabel: "Build core strength",
  },
  {
    slug: "dances-12-sessions",
    name: "12 Sessions",
    categoryName: "Dances",
    description: "Twelve choreography-led sessions across a luminous month.",
    priceCents: 88_000,
    sessionsPerMonth: 12,
    periodDays: 30,
    guestCount: 0,
    displayOrder: 1,
    features: ["Rhythm and mobility", "Expressive coaching", "Weekly playlists"],
    buttonLabel: "Keep moving",
  },
];
