import {
  ADMIN_LIST_EMPHASIZED_HEADER,
  ADMIN_LIST_ROW_CLASS,
  USER_LIST_CELL_CLASS,
  buildAdminListHeaderClass,
  buildAdminListTableClass,
} from "@/components/admin/admin-list-table-layout";

/** Coach · Earnings · Sessions · Month · Payout — five equal tracks. */
const FINANCE_COACH_GRID_CLASS = "md:grid-cols-[repeat(5,minmax(0,1fr))]";

export const ADMIN_FINANCE_COACH_LIST_TABLE_CLASS = buildAdminListTableClass(FINANCE_COACH_GRID_CLASS);

export const ADMIN_FINANCE_COACH_LIST_HEADER_CLASS = buildAdminListHeaderClass();

export const ADMIN_FINANCE_COACH_LIST_ROW_CLASS = ADMIN_LIST_ROW_CLASS;

export const ADMIN_FINANCE_COACH_LIST_HEADER_CELL = "min-w-0";

export const ADMIN_FINANCE_COACH_LIST_COACH_CELL = USER_LIST_CELL_CLASS;

export const ADMIN_FINANCE_COACH_LIST_MONEY_CELL = `${USER_LIST_CELL_CLASS} tabular-nums`;

export const ADMIN_FINANCE_COACH_LIST_SESSIONS_CELL = [
  USER_LIST_CELL_CLASS,
  "tabular-nums md:flex md:items-center",
].join(" ");

export const ADMIN_FINANCE_COACH_LIST_MONTH_CELL = `${USER_LIST_CELL_CLASS} tabular-nums`;

export const ADMIN_FINANCE_COACH_LIST_PAYOUT_CELL = [
  USER_LIST_CELL_CLASS,
  "md:flex md:items-center",
].join(" ");

export const ADMIN_FINANCE_COACH_LIST_EMPHASIZED_HEADER = ADMIN_LIST_EMPHASIZED_HEADER;
