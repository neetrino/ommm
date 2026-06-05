import {
  USER_LIST_CELL_CLASS,
  USER_LIST_DATE_CELL,
  USER_LIST_HEADER_SURFACE,
  USER_LIST_ROW_CARD,
  USER_LIST_SPACER_CELL,
  USER_LIST_STATUS_CELL,
  USER_LIST_TABLE_GRID_GAP,
  USER_LIST_TABLE_HEADER_PAD,
  USER_LIST_TABLE_HEADER_TEXT,
  USER_LIST_TABLE_ROW_PAD,
  USER_LIST_TABLE_SUBGRID_ROW,
  USER_LIST_TIME_CELL,
  USER_PAYMENTS_LIST_GRID_COLS,
} from "@/components/account/user-list-table-layout";

export { USER_PAYMENTS_LIST_GRID_COLS };

export const USER_PAYMENTS_LIST_TABLE_CLASS = [
  "max-md:space-y-3",
  "md:grid",
  "md:grid-cols-[minmax(0,11rem)_minmax(8.5rem,auto)_1fr_3.25rem_minmax(5.5rem,auto)_minmax(7rem,auto)_minmax(7.5rem,auto)]",
  USER_LIST_TABLE_GRID_GAP,
  "md:gap-y-3",
].join(" ");

export const USER_PAYMENTS_LIST_HEADER_CLASS = [
  "hidden",
  USER_LIST_TABLE_SUBGRID_ROW,
  USER_LIST_HEADER_SURFACE,
  USER_LIST_TABLE_HEADER_PAD,
  USER_LIST_TABLE_HEADER_TEXT,
  "md:grid",
  "md:items-end",
].join(" ");

export const USER_PAYMENTS_LIST_ROW_CLASS = [
  USER_LIST_ROW_CARD,
  "grid w-full grid-cols-1 gap-3 text-left",
  USER_LIST_TABLE_ROW_PAD,
  "md:col-span-full md:grid md:grid-cols-subgrid md:items-center md:gap-y-0",
].join(" ");

export {
  USER_LIST_CELL_CLASS as USER_PAYMENTS_LIST_CELL_CLASS,
  USER_LIST_DATE_CELL as USER_PAYMENTS_LIST_DATE_CELL,
  USER_LIST_SPACER_CELL as USER_PAYMENTS_LIST_SPACER_CELL,
  USER_LIST_STATUS_CELL as USER_PAYMENTS_LIST_STATUS_CELL,
  USER_LIST_TIME_CELL as USER_PAYMENTS_LIST_TIME_CELL,
};
