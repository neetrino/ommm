import {
  USER_LIST_ACTIONS_CELL,
  USER_LIST_CELL_CLASS,
  USER_LIST_DATE_CELL,
  USER_LIST_HEADER_SURFACE,
  USER_LIST_ROW_INTERACTIVE,
  USER_LIST_SPACER_CELL,
  USER_LIST_STACK_CLASS,
  USER_LIST_TABLE_GRID_GAP,
  USER_LIST_TABLE_HEADER_PAD,
  USER_LIST_TABLE_HEADER_TEXT,
  USER_LIST_TABLE_ROW_PAD,
  USER_LIST_TABLE_SUBGRID_ROW,
  USER_LIST_TIME_CELL,
  USER_LIST_TRAILING_CELL,
  USER_LIST_TRAILING_HEADER_CELL,
} from "@/components/account/user-list-table-layout";

export {
  USER_LIST_ACTIONS_CELL,
  USER_LIST_CELL_CLASS,
  USER_LIST_DATE_CELL,
  USER_LIST_HEADER_SURFACE,
  USER_LIST_ROW_INTERACTIVE,
  USER_LIST_SPACER_CELL,
  USER_LIST_STACK_CLASS,
  USER_LIST_TABLE_GRID_GAP,
  USER_LIST_TABLE_HEADER_PAD,
  USER_LIST_TABLE_HEADER_TEXT,
  USER_LIST_TABLE_ROW_PAD,
  USER_LIST_TABLE_SUBGRID_ROW,
  USER_LIST_TIME_CELL,
  USER_LIST_TRAILING_CELL,
  USER_LIST_TRAILING_HEADER_CELL,
};

/** Keeps admin list/board card surfaces inside the mobile viewport. */
export const ADMIN_CARD_CONTAIN_CLASS = "min-w-0 max-w-full overflow-x-clip";

export const ADMIN_LIST_ROW_SURFACE = [
  ADMIN_CARD_CONTAIN_CLASS,
  "rounded-[24px] border border-white/80 bg-white/95",
  "shadow-[0_10px_28px_-18px_rgba(45,40,35,0.28)]",
  "transition-[border-color,background-color,box-shadow,transform] duration-200",
  "hover:-translate-y-px hover:border-sand-500/35 hover:bg-white",
  "hover:shadow-[0_18px_40px_-20px_rgba(45,40,35,0.34)]",
  "focus-within:-translate-y-px focus-within:border-sand-500/45 focus-within:bg-sand-50/50",
  "focus-within:shadow-[0_18px_40px_-20px_rgba(45,40,35,0.34)]",
].join(" ");

export const ADMIN_LIST_ROW_CLASS = [
  ADMIN_LIST_ROW_SURFACE,
  USER_LIST_ROW_INTERACTIVE,
  "group",
  "grid w-full grid-cols-1 gap-3 text-left",
  USER_LIST_TABLE_ROW_PAD,
  "md:col-span-full md:grid md:grid-cols-subgrid md:items-center md:gap-y-0",
].join(" ");

/** Row actions — visible on hover/focus; always shown on touch/narrow viewports. */
export const ADMIN_LIST_ROW_ACTIONS_HOVER_REVEAL = [
  "max-md:opacity-100 max-md:pointer-events-auto",
  "md:opacity-0 md:pointer-events-none md:transition-opacity md:duration-200",
  "md:group-hover:opacity-100 md:group-hover:pointer-events-auto",
  "md:group-focus-within:opacity-100 md:group-focus-within:pointer-events-auto",
].join(" ");

export const ADMIN_LIST_EMPHASIZED_HEADER =
  "text-[11px] font-semibold uppercase tracking-[0.1em] text-sage-600";

/** Clickable primary row title in admin lists. */
export const ADMIN_LIST_TITLE_LINK_CLASS =
  "block w-full min-w-0 truncate text-left text-sm font-medium text-sage-900 underline-offset-2 hover:underline";

/** Primary plain-text row title in admin lists. */
export const ADMIN_LIST_TITLE_TEXT_CLASS =
  "block w-full min-w-0 truncate text-sm font-medium text-sage-900";

/** Primary serif row title in admin lists. */
export const ADMIN_LIST_TITLE_SERIF_CLASS =
  "block w-full min-w-0 truncate font-serif text-xl leading-snug tracking-tight text-sage-950";

export function buildAdminListTableClass(gridColsClass: string): string {
  return [
    ADMIN_CARD_CONTAIN_CLASS,
    "max-md:space-y-3",
    "md:grid",
    gridColsClass,
    USER_LIST_TABLE_GRID_GAP,
    "md:gap-y-3",
  ].join(" ");
}

export function buildAdminListHeaderClass(): string {
  return [
    "hidden",
    USER_LIST_TABLE_SUBGRID_ROW,
    USER_LIST_HEADER_SURFACE,
    USER_LIST_TABLE_HEADER_PAD,
    USER_LIST_TABLE_HEADER_TEXT,
    "md:grid",
    "md:items-end",
  ].join(" ");
}
