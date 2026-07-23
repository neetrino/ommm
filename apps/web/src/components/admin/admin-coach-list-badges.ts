export const ADMIN_COACH_CLASS_BADGE_CLASS =
  "inline-flex max-w-full shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em]";

const COACH_CLASS_BADGE_TONES = [
  "bg-sky-100 text-sky-900",
  "bg-violet-100 text-violet-900",
  "bg-amber-100 text-amber-900",
  "bg-rose-100 text-rose-800",
  "bg-mint-100 text-sage-800",
] as const;

export function coachClassBadgeTone(index: number): string {
  return COACH_CLASS_BADGE_TONES[index % COACH_CLASS_BADGE_TONES.length];
}

export const ADMIN_COACH_STATUS_BADGE_CLASS =
  "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide";

export function coachStatusBadgeTone(isActive: boolean): string {
  return isActive ? "bg-mint-100 text-sage-800" : "bg-sand-100 text-sage-600";
}
