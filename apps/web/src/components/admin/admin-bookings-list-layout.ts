import {
  USER_LIST_ACTIONS_CELL,
  USER_LIST_CELL_CLASS,
  USER_LIST_HEADER_SURFACE,
  USER_LIST_ROW_INTERACTIVE,
  USER_LIST_SPACER_CELL,
  USER_LIST_STACK_CLASS,
  USER_LIST_TABLE_GRID_GAP,
  USER_LIST_TABLE_HEADER_PAD,
  USER_LIST_TABLE_HEADER_TEXT,
  USER_LIST_TABLE_ROW_PAD,
  USER_LIST_TABLE_SUBGRID_ROW,
  USER_LIST_TRAILING_CELL,
  USER_LIST_TRAILING_HEADER_CELL,
} from "@/components/account/user-list-table-layout";

export const ADMIN_BOOKINGS_LIST_GRID_COLS =
  "minmax(0,1fr)_minmax(0,1.15fr)_auto_auto_auto_auto_1fr_auto";

export const ADMIN_BOOKINGS_LIST_TABLE_CLASS = [
  "max-md:space-y-3",
  "md:grid",
  "md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_auto_auto_auto_auto_1fr_auto]",
  USER_LIST_TABLE_GRID_GAP,
  "md:gap-y-3",
].join(" ");

export const ADMIN_BOOKINGS_LIST_HEADER_CLASS = [
  "hidden",
  USER_LIST_TABLE_SUBGRID_ROW,
  USER_LIST_HEADER_SURFACE,
  USER_LIST_TABLE_HEADER_PAD,
  USER_LIST_TABLE_HEADER_TEXT,
  "md:grid",
  "md:items-end",
].join(" ");

const ADMIN_BOOKINGS_LIST_ROW_SURFACE = [
  "rounded-[24px] border border-white/80 bg-white/95",
  "shadow-[0_32px_72px_-28px_rgba(45,40,35,0.42)]",
  "transition-[border-color,box-shadow,transform] duration-200",
  "hover:border-white hover:shadow-[0_44px_96px_-26px_rgba(45,40,35,0.5)]",
].join(" ");

export const ADMIN_BOOKINGS_LIST_ROW_CLASS = [
  ADMIN_BOOKINGS_LIST_ROW_SURFACE,
  USER_LIST_ROW_INTERACTIVE,
  "group",
  "grid w-full grid-cols-1 gap-3 text-left",
  USER_LIST_TABLE_ROW_PAD,
  "md:col-span-full md:grid md:grid-cols-subgrid md:items-center md:gap-y-0",
].join(" ");

/** List row actions — visible on hover/focus; always shown on touch/narrow viewports. */
export const ADMIN_BOOKINGS_LIST_ROW_ACTIONS_HOVER_REVEAL = [
  "max-md:opacity-100 max-md:pointer-events-auto",
  "md:opacity-0 md:pointer-events-none md:transition-opacity md:duration-200",
  "md:group-hover:opacity-100 md:group-hover:pointer-events-auto",
  "md:group-focus-within:opacity-100 md:group-focus-within:pointer-events-auto",
].join(" ");

export const ADMIN_BOOKINGS_LIST_CELL = USER_LIST_CELL_CLASS;

export const ADMIN_BOOKINGS_LIST_STATUS_CELL = USER_LIST_TRAILING_CELL;

export const ADMIN_BOOKINGS_LIST_ACTIONS_CELL = USER_LIST_ACTIONS_CELL;

export const ADMIN_BOOKINGS_LIST_ACTIONS_HEADER_CELL = USER_LIST_TRAILING_HEADER_CELL;

export const ADMIN_BOOKINGS_LIST_SPACER_CELL = USER_LIST_SPACER_CELL;

export const ADMIN_BOOKINGS_LIST_STACK_CLASS = USER_LIST_STACK_CLASS;
