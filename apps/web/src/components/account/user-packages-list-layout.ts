import {
  USER_LIST_CELL_CLASS,
  USER_LIST_HEADER_SURFACE,
  USER_LIST_ROW_CARD,
  USER_LIST_ROW_INTERACTIVE,
  USER_LIST_STATUS_CELL,
  USER_LIST_TABLE_GRID_GAP,
  USER_LIST_TABLE_HEADER_PAD,
  USER_LIST_TABLE_HEADER_TEXT,
  USER_LIST_TABLE_ROW_PAD,
  USER_LIST_TABLE_SUBGRID_ROW,
  USER_PACKAGES_LIST_GRID_COLS,
} from "@/components/account/user-list-table-layout";

export { USER_PACKAGES_LIST_GRID_COLS };

/** Seven equal tracks — same rhythm as payments list (`md:grid-cols-6`). */
export const USER_PACKAGES_LIST_TABLE_CLASS = [
  "max-md:space-y-3",
  "md:grid",
  "md:grid-cols-7",
  USER_LIST_TABLE_GRID_GAP,
  "md:gap-y-3",
].join(" ");

export const USER_PACKAGES_LIST_HEADER_CLASS = [
  "hidden",
  USER_LIST_TABLE_SUBGRID_ROW,
  USER_LIST_HEADER_SURFACE,
  USER_LIST_TABLE_HEADER_PAD,
  USER_LIST_TABLE_HEADER_TEXT,
  "md:grid",
  "md:items-end",
].join(" ");

export const USER_PACKAGES_LIST_CENTER_HEADER_CELL = "md:text-center";

export const USER_PACKAGES_LIST_ROW_CLASS = [
  USER_LIST_ROW_CARD,
  USER_LIST_ROW_INTERACTIVE,
  "grid w-full grid-cols-1 gap-3 text-left",
  USER_LIST_TABLE_ROW_PAD,
  "md:col-span-full md:grid md:grid-cols-subgrid md:items-center md:gap-y-0",
].join(" ");

export const USER_PACKAGES_LIST_CELL_CLASS = USER_LIST_CELL_CLASS;

export const USER_PACKAGES_LIST_VALIDITY_CELL = [
  USER_LIST_CELL_CLASS,
  "whitespace-nowrap md:text-center",
].join(" ");

export const USER_PACKAGES_LIST_PRICE_CELL = [
  USER_LIST_CELL_CLASS,
  "whitespace-nowrap tabular-nums md:text-center",
].join(" ");

export const USER_PACKAGES_LIST_SESSIONS_CELL = [
  USER_LIST_CELL_CLASS,
  "md:text-center",
].join(" ");

export const USER_PACKAGES_LIST_PERIOD_CELL = [
  USER_LIST_CELL_CLASS,
  "md:flex md:justify-center",
].join(" ");

export const USER_PACKAGES_LIST_STATUS_CELL = [
  USER_LIST_STATUS_CELL,
  "md:flex md:justify-center",
].join(" ");

export const USER_PACKAGES_LIST_ACTIONS_CELL = [
  USER_LIST_CELL_CLASS,
  "md:flex md:flex-col md:items-center md:justify-center",
].join(" ");

export const USER_PACKAGES_LIST_ACTIONS_HEADER_CELL = USER_PACKAGES_LIST_CENTER_HEADER_CELL;
