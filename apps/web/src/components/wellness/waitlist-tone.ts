export type WaitlistTone = "light" | "dark" | "warm" | "cool";

export const WAITLIST_TONE_CARD: Record<WaitlistTone, string> = {
  light: "bg-white/65 ommm-card-organic ring-1 ring-white/60",
  dark: "bg-sage-900/85 text-cream-50 ommm-card-organic-mirror",
  warm: "bg-sand-100/70 ommm-card-organic-mirror ring-1 ring-white/60",
  cool: "bg-blue-100/60 ommm-card-organic ring-1 ring-white/60",
};

export const WAITLIST_TONE_TITLE: Record<WaitlistTone, string> = {
  light: "text-sage-900",
  dark: "text-white",
  warm: "text-sage-900",
  cool: "text-sage-900",
};

export const WAITLIST_TONE_META: Record<WaitlistTone, string> = {
  light: "text-sage-700",
  dark: "text-cream-50/85",
  warm: "text-sand-700",
  cool: "text-sage-700",
};

export const WAITLIST_TONE_SUB: Record<WaitlistTone, string> = {
  light: "text-sage-500",
  dark: "text-cream-50/65",
  warm: "text-sand-700/80",
  cool: "text-sage-500",
};

export function waitlistToneAtIndex(index: number): WaitlistTone {
  const cycle: WaitlistTone[] = ["light", "dark", "warm", "cool"];
  return cycle[index % cycle.length]!;
}
