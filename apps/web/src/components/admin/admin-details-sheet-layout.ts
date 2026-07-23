/** Default admin side sheet height — inset from top/bottom via overlay `items-end`. */
export const ADMIN_DETAILS_SHEET_HEIGHT_CLASS = "h-[95dvh]";

const ADMIN_DETAILS_SHEET_PANEL_SHELL_CLASS = [
  "relative z-10 flex flex-col overflow-hidden",
  ADMIN_DETAILS_SHEET_HEIGHT_CLASS,
  "rounded-tl-[28px] border border-white/70 border-b-0 border-r-0",
  "bg-white/95 shadow-[-16px_0_48px_-24px_rgba(45,40,35,0.4)] backdrop-blur-md",
].join(" ");

/** Solid panel shell for nested drawers — avoids expensive backdrop-blur while scrolling. */
const ADMIN_NESTED_DETAILS_SHEET_PANEL_SHELL_CLASS = [
  "relative z-10 flex flex-col overflow-hidden",
  ADMIN_DETAILS_SHEET_HEIGHT_CLASS,
  "rounded-tl-[28px] border border-white/70 border-b-0 border-r-0",
  "bg-white shadow-[-16px_0_48px_-24px_rgba(45,40,35,0.4)]",
].join(" ");

/** Narrow detail sheets (schedule rows). */
export const ADMIN_DETAILS_SHEET_WIDTH_CLASS =
  "w-full sm:w-1/4 sm:max-w-[25vw] sm:min-w-[18rem]";

/** Bookings detail sheet — slightly wider for details, notes, and actions. */
export const ADMIN_BOOKINGS_DETAILS_SHEET_WIDTH_CLASS =
  "w-full sm:w-1/3 sm:max-w-[32rem] sm:min-w-[22rem]";

/** Member packages detail sheet — slightly wider than default narrow admin sheets. */
export const USER_MEMBERSHIP_DETAILS_SHEET_WIDTH_CLASS =
  "w-full sm:w-[36vw] sm:max-w-[36rem] sm:min-w-[22rem]";

/** Medium sheets (user lookup, finance session list). */
export const ADMIN_DETAILS_SHEET_MEDIUM_WIDTH_CLASS =
  "w-full sm:max-w-md sm:min-w-[20rem]";

/** Wide form / profile sheets (clients, coaches, class types). */
export const ADMIN_DETAILS_SHEET_WIDE_WIDTH_CLASS =
  "w-full sm:w-1/2 sm:max-w-3xl sm:min-w-[24rem]";

export const ADMIN_DETAILS_SHEET_PANEL_CLASS = [
  ADMIN_DETAILS_SHEET_PANEL_SHELL_CLASS,
  ADMIN_DETAILS_SHEET_WIDTH_CLASS,
].join(" ");

export const ADMIN_BOOKINGS_DETAILS_SHEET_PANEL_CLASS = [
  ADMIN_DETAILS_SHEET_PANEL_SHELL_CLASS,
  ADMIN_BOOKINGS_DETAILS_SHEET_WIDTH_CLASS,
].join(" ");

export const USER_MEMBERSHIP_DETAILS_SHEET_PANEL_CLASS = [
  ADMIN_DETAILS_SHEET_PANEL_SHELL_CLASS,
  USER_MEMBERSHIP_DETAILS_SHEET_WIDTH_CLASS,
].join(" ");

export const ADMIN_DETAILS_SHEET_MEDIUM_PANEL_CLASS = [
  ADMIN_DETAILS_SHEET_PANEL_SHELL_CLASS,
  ADMIN_DETAILS_SHEET_MEDIUM_WIDTH_CLASS,
].join(" ");

export const ADMIN_WIDE_DRAWER_PANEL_CLASS = [
  ADMIN_DETAILS_SHEET_PANEL_SHELL_CLASS,
  ADMIN_DETAILS_SHEET_WIDE_WIDTH_CLASS,
].join(" ");

export const ADMIN_NESTED_WIDE_DRAWER_PANEL_CLASS = [
  ADMIN_NESTED_DETAILS_SHEET_PANEL_SHELL_CLASS,
  ADMIN_DETAILS_SHEET_WIDE_WIDTH_CLASS,
].join(" ");

export const ADMIN_NESTED_DETAILS_SHEET_BODY_CLASS =
  "flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-5 py-5 sm:px-6";

export const ADMIN_DETAILS_SHEET_OVERLAY_CLASS =
  "ommm-drawer-overlay z-[105] items-end";

export const ADMIN_DETAILS_SHEET_OVERLAY_ELEVATED_CLASS =
  "ommm-drawer-overlay z-[110] items-end";

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

/** Matches compact header actions (e.g. Deactivate) height in admin client drawer. */
export const ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl leading-none text-sage-500 transition-colors hover:bg-white/60 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45";

export const ADMIN_DETAILS_SHEET_TITLE_CLASS =
  "font-serif text-2xl font-normal text-sage-900";

export const ADMIN_DETAILS_SHEET_LEDE_CLASS = "text-sm text-sage-600";

export const ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS =
  "text-xs font-semibold uppercase tracking-[0.08em] text-sage-500";

export const ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS =
  "text-sm font-medium text-sage-800";
