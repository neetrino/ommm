/**
 * Visual tokens for the Admin dashboard — aligned with the member (USER)
 * wellness surfaces: glass cards, sage typography, sand accents.
 */

export const adminChrome = {
  pageTitle: "ommm-h2",
  sectionTitle: "ommm-h3 text-sage-800",
  lede: "ommm-body-muted mt-3 max-w-2xl",
  ledeTight: "ommm-body-muted mt-2 max-w-2xl",
  metricCard:
    "rounded-[24px] border border-white/60 bg-white/55 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md",
  metricLabel:
    "text-xs font-medium uppercase tracking-wide text-sage-500",
  metricValue: "mt-2 text-2xl font-semibold tabular-nums text-sage-900",
  panel:
    "rounded-[24px] border border-white/60 bg-white/55 p-4 text-sm text-sage-700 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5",
  panelHeading: "font-medium text-sage-900",
  accordion:
    "rounded-[24px] border border-[rgba(212,196,183,0.2)] bg-white/78 backdrop-blur-md",
  tableWrap:
    "overflow-x-auto rounded-[24px] border border-white/60 bg-white/55 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md",
  table: "w-full min-w-[32rem] border-collapse text-left text-sm",
  thead: "border-b border-white/50 bg-white/35 text-xs uppercase tracking-wide text-sage-500",
  th: "px-4 py-3 font-medium",
  tr: "border-b border-white/40 last:border-b-0",
  tdStrong: "px-4 py-3 font-medium text-sage-900",
  td: "px-4 py-3 text-sage-700",
  tdMuted: "px-4 py-3 text-sage-500",
  metaText: "text-xs text-sage-500",
  tdMono: "px-4 py-3 font-mono text-xs text-sage-900",
  inlineCode:
    "rounded-lg border border-white/50 bg-white/50 px-1.5 py-0.5 text-xs text-sage-800 backdrop-blur-sm",
} as const;
