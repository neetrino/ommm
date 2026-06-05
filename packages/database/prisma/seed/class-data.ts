import { ClassSessionStatus } from "@prisma/client";
import { SEED_SESSION_TITLE_PREFIX } from "./constants";

export type ClassTypeSeed = {
  slug: string;
  name: string;
  description: string;
};

export const CLASS_TYPE_SEEDS: readonly ClassTypeSeed[] = [
  {
    slug: "reformer-group",
    name: "Reformer Group",
    description: "Small-group reformer classes with layered progressions.",
  },
  {
    slug: "reformer-individual",
    name: "Reformer Individual",
    description: "Private reformer coaching tailored to your body.",
  },
  {
    slug: "yoga",
    name: "Yoga",
    description: "Breath-led flows for balance, mobility, and calm.",
  },
  {
    slug: "mat-pilates",
    name: "Mat Pilates",
    description: "Core-centered mat work for every level.",
  },
  {
    slug: "dances",
    name: "Dances",
    description: "Expressive choreography with joyful studio energy.",
  },
];

export type SessionBlueprint = {
  key: string;
  classTypeSlug: string;
  coachEmail: string;
  dayOffset: number;
  hour: number;
  title: string;
  capacity: number;
  status: ClassSessionStatus;
  level: string;
  priceCents: number;
};

export const SESSION_BLUEPRINTS: readonly SessionBlueprint[] = [
  {
    key: "reformer-group-tomorrow-morning",
    classTypeSlug: "reformer-group",
    coachEmail: "coach@ommm.local",
    dayOffset: 1,
    hour: 9,
    title: `${SEED_SESSION_TITLE_PREFIX} Morning Reformer Pulse`,
    capacity: 8,
    status: ClassSessionStatus.ACTIVE,
    level: "Open",
    priceCents: 15_000,
  },
  {
    key: "reformer-group-full",
    classTypeSlug: "reformer-group",
    coachEmail: "coach@ommm.local",
    dayOffset: 2,
    hour: 18,
    title: `${SEED_SESSION_TITLE_PREFIX} Sunset Reformer Flow`,
    capacity: 2,
    status: ClassSessionStatus.FULL,
    level: "Intermediate",
    priceCents: 15_000,
  },
  {
    key: "reformer-group-waitlist-offered",
    classTypeSlug: "reformer-group",
    coachEmail: "coach@ommm.local",
    dayOffset: 3,
    hour: 17,
    title: `${SEED_SESSION_TITLE_PREFIX} Waitlist Offer Reformer`,
    capacity: 2,
    status: ClassSessionStatus.FULL,
    level: "Open",
    priceCents: 15_000,
  },
  {
    key: "yoga-waitlist-expired",
    classTypeSlug: "yoga",
    coachEmail: "coach3@ommm.local",
    dayOffset: -2,
    hour: 8,
    title: `${SEED_SESSION_TITLE_PREFIX} Expired Waitlist Yoga`,
    capacity: 12,
    status: ClassSessionStatus.ACTIVE,
    level: "Open",
    priceCents: 9_000,
  },
  {
    key: "mat-waitlist-removed",
    classTypeSlug: "mat-pilates",
    coachEmail: "coach3@ommm.local",
    dayOffset: 6,
    hour: 18,
    title: `${SEED_SESSION_TITLE_PREFIX} Removed Waitlist Mat`,
    capacity: 10,
    status: ClassSessionStatus.ACTIVE,
    level: "Open",
    priceCents: 9_000,
  },
  {
    key: "dances-waitlist-converted",
    classTypeSlug: "dances",
    coachEmail: "coach3@ommm.local",
    dayOffset: 7,
    hour: 19,
    title: `${SEED_SESSION_TITLE_PREFIX} Converted Waitlist Dance`,
    capacity: 14,
    status: ClassSessionStatus.ACTIVE,
    level: "Open",
    priceCents: 9_000,
  },
  {
    key: "reformer-individual-private",
    classTypeSlug: "reformer-individual",
    coachEmail: "coach2@ommm.local",
    dayOffset: 3,
    hour: 11,
    title: `${SEED_SESSION_TITLE_PREFIX} Private Reformer Sculpt`,
    capacity: 1,
    status: ClassSessionStatus.ACTIVE,
    level: "All levels",
    priceCents: 30_000,
  },
  {
    key: "yoga-sunrise",
    classTypeSlug: "yoga",
    coachEmail: "coach3@ommm.local",
    dayOffset: 1,
    hour: 7,
    title: `${SEED_SESSION_TITLE_PREFIX} Sunrise Vinyasa`,
    capacity: 12,
    status: ClassSessionStatus.ACTIVE,
    level: "Open",
    priceCents: 9_000,
  },
  {
    key: "mat-pilates-core",
    classTypeSlug: "mat-pilates",
    coachEmail: "coach3@ommm.local",
    dayOffset: 4,
    hour: 19,
    title: `${SEED_SESSION_TITLE_PREFIX} Core Glow Mat`,
    capacity: 10,
    status: ClassSessionStatus.ACTIVE,
    level: "Beginner friendly",
    priceCents: 9_000,
  },
  {
    key: "dances-rhythm",
    classTypeSlug: "dances",
    coachEmail: "coach3@ommm.local",
    dayOffset: 5,
    hour: 20,
    title: `${SEED_SESSION_TITLE_PREFIX} Rhythm & Release`,
    capacity: 14,
    status: ClassSessionStatus.ACTIVE,
    level: "Open",
    priceCents: 9_000,
  },
  {
    key: "reformer-group-past",
    classTypeSlug: "reformer-group",
    coachEmail: "coach@ommm.local",
    dayOffset: -7,
    hour: 10,
    title: `${SEED_SESSION_TITLE_PREFIX} Past Week Reformer`,
    capacity: 8,
    status: ClassSessionStatus.ACTIVE,
    level: "Open",
    priceCents: 15_000,
  },
  {
    key: "yoga-cancelled",
    classTypeSlug: "yoga",
    coachEmail: "coach3@ommm.local",
    dayOffset: 6,
    hour: 8,
    title: `${SEED_SESSION_TITLE_PREFIX} Cancelled Gentle Flow`,
    capacity: 12,
    status: ClassSessionStatus.CANCELLED,
    level: "Open",
    priceCents: 9_000,
  },
];

export function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

export function sessionWindow(dayOffset: number, hour: number): { startsAt: Date; endsAt: Date } {
  const startsAt = addDays(new Date(), dayOffset);
  startsAt.setHours(hour, 0, 0, 0);
  const endsAt = new Date(startsAt);
  endsAt.setMinutes(endsAt.getMinutes() + 55);
  return { startsAt, endsAt };
}
