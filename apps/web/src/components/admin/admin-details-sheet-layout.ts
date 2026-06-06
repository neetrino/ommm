export const ADMIN_DETAILS_SHEET_WIDTH_CLASS =
  "w-full sm:w-1/4 sm:max-w-[25vw] sm:min-w-[18rem]";

export const ADMIN_DETAILS_SHEET_HEIGHT_CLASS = "h-[90dvh]";

export const ADMIN_DETAILS_SHEET_PANEL_CLASS = [
  "relative z-10 flex flex-col overflow-hidden",
  ADMIN_DETAILS_SHEET_WIDTH_CLASS,
  ADMIN_DETAILS_SHEET_HEIGHT_CLASS,
  "rounded-tl-[28px] border border-white/70 border-b-0 border-r-0",
  "bg-white/95 shadow-[-16px_0_48px_-24px_rgba(45,40,35,0.4)] backdrop-blur-md",
].join(" ");

export const ADMIN_WIDE_DRAWER_PANEL_CLASS = [
  "relative z-10 flex h-full w-full max-w-3xl flex-col overflow-hidden",
  "border-l border-white/70",
  "bg-white/95 shadow-[-16px_0_48px_-24px_rgba(45,40,35,0.4)] backdrop-blur-md",
].join(" ");

export const ADMIN_DETAILS_SHEET_HEADER_CLASS =
  "shrink-0 border-b border-white/60 px-5 py-4 sm:px-6 sm:py-5";

export const ADMIN_DETAILS_SHEET_BODY_CLASS =
  "flex-1 overflow-y-auto px-5 py-5 sm:px-6";

export const ADMIN_DETAILS_SHEET_FOOTER_CLASS =
  "shrink-0 border-t border-white/60 px-5 py-4 sm:px-6";

export const ADMIN_DETAILS_SHEET_DETAIL_BLOCK_CLASS =
  "space-y-3 rounded-2xl border border-white/60 bg-white/50 p-4";

export const ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS =
  "rounded-full p-2 text-sage-500 transition-colors hover:bg-white/60 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

export const ADMIN_DETAILS_SHEET_TITLE_CLASS =
  "font-serif text-2xl font-normal text-sage-900";

export const ADMIN_DETAILS_SHEET_LEDE_CLASS = "text-sm text-sage-600";

export const ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS =
  "text-xs font-semibold uppercase tracking-[0.08em] text-sage-500";

export const ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS =
  "text-sm font-medium text-sage-800";
