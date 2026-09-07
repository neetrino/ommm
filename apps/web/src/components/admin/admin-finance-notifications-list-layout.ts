import {
  ADMIN_LIST_EMPHASIZED_HEADER,
  ADMIN_LIST_ROW_CLASS,
  USER_LIST_CELL_CLASS,
  buildAdminListHeaderClass,
  buildAdminListTableClass,
} from "@/components/admin/admin-list-table-layout";

/** Coach · Unpaid · Sessions · Month · Status · Actions — six equal tracks. */
const FINANCE_COACH_GRID_CLASS = "md:grid-cols-[repeat(6,minmax(0,1fr))]";

export const ADMIN_FINANCE_COACH_LIST_TABLE_CLASS = buildAdminListTableClass(FINANCE_COACH_GRID_CLASS);

export const ADMIN_FINANCE_COACH_LIST_HEADER_CLASS = buildAdminListHeaderClass();

export const ADMIN_FINANCE_COACH_LIST_ROW_CLASS = ADMIN_LIST_ROW_CLASS;

export const ADMIN_FINANCE_COACH_LIST_HEADER_CELL = "min-w-0 md:text-center";

/** First column label — flush left like coach names in the rows. */
export const ADMIN_FINANCE_COACH_LIST_HEADER_CELL_START = "min-w-0 md:text-left";

export const ADMIN_FINANCE_COACH_LIST_COACH_CELL = USER_LIST_CELL_CLASS;

export const ADMIN_FINANCE_COACH_LIST_MONEY_CELL = `${USER_LIST_CELL_CLASS} tabular-nums md:text-center`;

export const ADMIN_FINANCE_COACH_LIST_SESSIONS_CELL = [
  USER_LIST_CELL_CLASS,
  "tabular-nums md:flex md:items-center md:justify-center md:text-center",
].join(" ");

export const ADMIN_FINANCE_COACH_LIST_MONTH_CELL = `${USER_LIST_CELL_CLASS} tabular-nums md:flex md:justify-center`;

export const ADMIN_FINANCE_COACH_LIST_PAYOUT_CELL = [
  USER_LIST_CELL_CLASS,
  "md:flex md:items-center md:justify-center md:text-center",
].join(" ");

export const ADMIN_FINANCE_COACH_LIST_ACTIONS_CELL = [
  USER_LIST_CELL_CLASS,
  "md:flex md:flex-col md:items-center md:justify-center md:text-center",
].join(" ");

export const ADMIN_FINANCE_COACH_LIST_EMPHASIZED_HEADER = ADMIN_LIST_EMPHASIZED_HEADER;

/** Coach · Paid amount · Salary month · Paid at — four equal tracks. */
const FINANCE_COACH_PAYOUT_HISTORY_GRID_CLASS = "md:grid-cols-[repeat(4,minmax(0,1fr))]";

export const ADMIN_FINANCE_COACH_PAYOUT_HISTORY_TABLE_CLASS = buildAdminListTableClass(
  FINANCE_COACH_PAYOUT_HISTORY_GRID_CLASS,
);

export const ADMIN_FINANCE_COACH_PAYOUT_HISTORY_HEADER_CLASS = buildAdminListHeaderClass();

export const ADMIN_FINANCE_COACH_PAYOUT_HISTORY_ROW_CLASS = ADMIN_LIST_ROW_CLASS;
