import { adminChrome } from "@/components/admin/admin-chrome";

const memberSurface =
  "rounded-[28px] border border-white/80 bg-white/95 shadow-[0_22px_54px_-34px_rgba(45,40,35,0.34)] backdrop-blur-md";

/** Member dashboard surfaces — same glass language as schedule board cards. */
export const memberChrome = {
  ...adminChrome,
  surface: memberSurface,
  surfacePad: "p-5 sm:p-6",
  emptyState: `${memberSurface} px-6 py-8 text-sm text-sage-600`,
  waitlistCard: `${memberSurface} flex flex-col gap-3 p-5 transition-all hover:border-white hover:shadow-[0_28px_64px_-34px_rgba(45,40,35,0.4)] sm:p-6`,
  achievementCard: `${memberSurface} p-5 sm:p-6`,
  cardTitle: "text-lg font-semibold leading-tight text-sage-900",
  cardMeta:
    "text-[11px] font-semibold uppercase tracking-[0.12em] text-sage-500",
  cardSub: "text-xs text-sage-500",
  heroTitle: "ommm-h2 max-w-[20ch] text-sage-800",
  heroLead: "ommm-body-muted mt-6 max-w-xl text-base sm:text-lg",
  greeting: "font-serif italic text-sage-600",
  statusPill:
    "rounded-full border border-white/60 bg-white/78 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-sage-700 backdrop-blur-md",
  nextClassShell:
    "rounded-[24px] border border-white/60 bg-white/55 p-4 text-sm text-sage-700 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5",
  nextClassImageWrap:
    "relative aspect-[16/10] w-full overflow-hidden rounded-[20px]",
  nextClassEmptyMedia:
    "relative flex aspect-[16/10] w-full flex-col justify-between overflow-hidden rounded-[20px] bg-gradient-to-br from-sand-100/95 via-white/80 to-mint-100/40 p-6 sm:p-8",
  nextClassBody: "flex flex-col gap-4 pt-4",
  explorePanel: `${memberSurface} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6`,
  coachNotice: `${memberSurface} mt-6 p-5 sm:p-6`,
} as const;
