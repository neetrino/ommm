type SessionStatus = "ACTIVE" | "CANCELLED" | "FULL" | "DRAFT";

export const ADMIN_SCHEDULE_LEVEL_BADGE_CLASS =
  "inline-flex max-w-full shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em]";

const LEVEL_BADGE_TONES: Record<string, string> = {
  Beginner: "bg-violet-100 text-violet-900",
  Intermediate: "bg-sky-100 text-sky-900",
  Advanced: "bg-amber-100 text-amber-900",
};

const LEVEL_BADGE_FALLBACK_TONES = [
  "bg-rose-100 text-rose-800",
  "bg-mint-100 text-sage-800",
  "bg-sand-100 text-sage-800",
] as const;

export function sessionLevelBadgeTone(level: string, index: number): string {
  return (
    LEVEL_BADGE_TONES[level] ??
    LEVEL_BADGE_FALLBACK_TONES[index % LEVEL_BADGE_FALLBACK_TONES.length]
  );
}

export const ADMIN_SCHEDULE_STATUS_BADGE_CLASS =
  "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide";

export function sessionStatusBadgeTone(status: SessionStatus): string {
  if (status === "ACTIVE") {
    return "bg-mint-100 text-sage-800";
  }
  if (status === "CANCELLED") {
    return "bg-sand-100 text-sage-600";
  }
  if (status === "FULL") {
    return "bg-rose-100 text-rose-800";
  }
  return "bg-zinc-100 text-zinc-700";
}
