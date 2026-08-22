export const ADMIN_COACH_CLASS_BADGE_CLASS =
  "inline-flex max-w-full shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em]";

const COACH_CLASS_BADGE_TONES = [
  "bg-sky-100 text-sky-900",
  "bg-violet-100 text-violet-900",
  "bg-amber-100 text-amber-900",
  "bg-rose-100 text-rose-800",
  "bg-mint-100 text-sage-800",
  "bg-orange-100 text-orange-900",
  "bg-teal-100 text-teal-900",
  "bg-indigo-100 text-indigo-900",
  "bg-fuchsia-100 text-fuchsia-900",
  "bg-lime-100 text-lime-900",
  "bg-cyan-100 text-cyan-900",
  "bg-emerald-100 text-emerald-900",
  "bg-purple-100 text-purple-900",
  "bg-peach-100 text-sand-700",
  "bg-blue-100 text-sage-800",
  "bg-pink-100 text-pink-800",
] as const;

export function coachClassBadgeTone(index: number): string {
  return COACH_CLASS_BADGE_TONES[index % COACH_CLASS_BADGE_TONES.length];
}

export function coachClassBadgeToneById(
  classTypeId: string,
  classOptions: readonly { readonly id: string }[],
): string {
  const catalogIndex = classOptions.findIndex((option) => option.id === classTypeId);
  return coachClassBadgeTone(catalogIndex >= 0 ? catalogIndex : 0);
}

export const ADMIN_COACH_STATUS_BADGE_CLASS =
  "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide";

export function coachStatusBadgeTone(isActive: boolean): string {
  return isActive ? "bg-mint-100 text-sage-800" : "bg-sand-100 text-sage-600";
}
