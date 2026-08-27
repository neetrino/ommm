import {
  ADMIN_LIST_EMPHASIZED_HEADER,
  ADMIN_LIST_ROW_SURFACE,
  USER_LIST_CELL_CLASS,
  USER_LIST_DATE_CELL,
  USER_LIST_HEADER_SURFACE,
  USER_LIST_ROW_INTERACTIVE,
  USER_LIST_TABLE_HEADER_PAD,
  USER_LIST_TABLE_ROW_PAD,
  USER_LIST_TABLE_SUBGRID_ROW,
  USER_LIST_TIME_CELL,
  buildAdminListTableClass,
} from "@/components/admin/admin-list-table-layout";

/** User · Package · Amount · Date · Time · Source · Status · Method — eight equal tracks. */
const FINANCE_PAYMENTS_GRID_CLASS = "md:grid-cols-[repeat(8,minmax(8.5rem,1fr))]";

/** Horizontal scroll when the table is wider than the viewport (scrollbar hidden). */
export const ADMIN_FINANCE_PAYMENTS_LIST_SCROLL_CLASS = [
  "w-full max-w-full overflow-x-auto overscroll-x-contain",
  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
].join(" ");

export const ADMIN_FINANCE_PAYMENTS_LIST_TABLE_CLASS = [
  buildAdminListTableClass(FINANCE_PAYMENTS_GRID_CLASS),
  "md:min-w-[68rem] md:w-full",
].join(" ");

export const ADMIN_FINANCE_PAYMENTS_LIST_HEADER_CLASS = [
  "hidden",
  USER_LIST_TABLE_SUBGRID_ROW,
  USER_LIST_HEADER_SURFACE,
  USER_LIST_TABLE_HEADER_PAD,
  "md:grid md:items-center",
].join(" ");

export const ADMIN_FINANCE_PAYMENTS_LIST_HEADER_CELL =
  "min-w-0 text-left text-xs font-semibold uppercase tracking-[0.08em] text-sage-500";

export const ADMIN_FINANCE_PAYMENTS_LIST_METHOD_HEADER_CELL =
  "min-w-0 text-center text-xs font-semibold uppercase tracking-[0.08em] text-sage-500";

export const ADMIN_FINANCE_PAYMENTS_LIST_ROW_CLASS = [
  ADMIN_LIST_ROW_SURFACE,
  USER_LIST_ROW_INTERACTIVE,
  "grid w-full grid-cols-1 gap-3 text-left",
  USER_LIST_TABLE_ROW_PAD,
  "md:col-span-full md:grid md:grid-cols-subgrid md:items-start md:gap-y-0",
].join(" ");

export const ADMIN_FINANCE_PAYMENTS_LIST_CELL = USER_LIST_CELL_CLASS;

export const ADMIN_FINANCE_PAYMENTS_LIST_USER_CELL =
  "min-w-0 w-full max-w-full justify-self-stretch text-left";

export const ADMIN_FINANCE_PAYMENTS_LIST_USER_TITLE_CLASS =
  "block w-full min-w-0 break-words text-lg font-semibold leading-snug text-sage-900";

export const ADMIN_FINANCE_PAYMENTS_LIST_USER_META_CLASS =
  "mt-0.5 break-words text-xs text-sage-500";

export const ADMIN_FINANCE_PAYMENTS_LIST_PACKAGE_CELL =
  "min-w-0 w-full max-w-full justify-self-stretch text-left";

export const ADMIN_FINANCE_PAYMENTS_LIST_PACKAGE_TITLE_CLASS =
  "block w-full min-w-0 break-words font-serif text-xl leading-snug tracking-tight text-sage-950";

export const ADMIN_FINANCE_PAYMENTS_LIST_DATE_CELL = USER_LIST_DATE_CELL;

export const ADMIN_FINANCE_PAYMENTS_LIST_TIME_CELL = USER_LIST_TIME_CELL;

export const ADMIN_FINANCE_PAYMENTS_LIST_STATUS_CELL = [
  USER_LIST_CELL_CLASS,
  "md:flex md:items-start md:self-start",
].join(" ");

export const ADMIN_FINANCE_PAYMENTS_LIST_SOURCE_CELL = USER_LIST_CELL_CLASS;

export const ADMIN_FINANCE_PAYMENTS_LIST_METHOD_CELL =
  "min-w-0 w-full max-w-full justify-self-stretch text-center";

export const ADMIN_FINANCE_PAYMENTS_LIST_METHOD_VALUE_CLASS =
  "text-sm font-medium text-sage-800";

export const ADMIN_FINANCE_PAYMENTS_LIST_EMPHASIZED_HEADER = ADMIN_LIST_EMPHASIZED_HEADER;
