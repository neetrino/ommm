import { adminChrome } from "@/components/admin/admin-chrome";

/** Member dashboard surfaces — same glass language as the admin panel. */
export const memberChrome = {
  ...adminChrome,
  emptyState: `${adminChrome.panel} px-6 py-8 text-sm text-sage-700`,
  waitlistCard: `${adminChrome.panel} flex flex-col gap-2 p-5 transition-colors hover:bg-white/65`,
  cardTitle: "text-lg font-semibold leading-tight text-sage-900",
  cardMeta:
    "text-[11px] font-semibold uppercase tracking-[0.12em] text-sage-500",
  cardSub: "text-xs text-sage-500",
  heroTitle: "ommm-h2 max-w-[20ch] text-sage-800",
  heroLead: "ommm-body-muted mt-6 max-w-xl text-base sm:text-lg",
  greeting: "font-serif italic text-sage-600",
  greetingName: "block font-medium text-sage-800",
  avatar:
    "inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/60 bg-white/78 text-sm font-semibold text-sage-800 shadow-sm backdrop-blur-md sm:h-14 sm:w-14",
  statusPill:
    "rounded-full border border-white/60 bg-white/78 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-sage-700 backdrop-blur-md",
  nextClassShell: `${adminChrome.panel} overflow-hidden p-0`,
  nextClassImageWrap: "relative aspect-[16/10] w-full",
  nextClassBody: "flex flex-col gap-4 px-6 py-6 sm:px-8 sm:py-7",
  coachNotice: `${adminChrome.panel} mt-6`,
} as const;
