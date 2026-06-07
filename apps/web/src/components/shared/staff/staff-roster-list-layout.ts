import {
  ADMIN_LIST_ROW_SURFACE,
  USER_LIST_ACTIONS_CELL,
  USER_LIST_CELL_CLASS,
  USER_LIST_DATE_CELL,
  USER_LIST_TABLE_ROW_PAD,
  buildAdminListHeaderClass,
  buildAdminListTableClass,
  ADMIN_LIST_EMPHASIZED_HEADER,
} from "@/components/admin/admin-list-table-layout";

const STAFF_ROSTER_GRID_CLASS =
  "md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(11rem,auto)_auto]";

export const STAFF_ROSTER_LIST_TABLE_CLASS = buildAdminListTableClass(STAFF_ROSTER_GRID_CLASS);

export const STAFF_ROSTER_LIST_HEADER_CLASS = buildAdminListHeaderClass();

export const STAFF_ROSTER_LIST_ROW_CLASS = [
  ADMIN_LIST_ROW_SURFACE,
  "grid w-full grid-cols-1 gap-3 text-left",
  USER_LIST_TABLE_ROW_PAD,
  "md:col-span-full md:grid md:grid-cols-subgrid md:items-center md:gap-y-0",
].join(" ");

export const STAFF_ROSTER_LIST_PARTICIPANT_CELL = USER_LIST_CELL_CLASS;

export const STAFF_ROSTER_LIST_CLASS_CELL = USER_LIST_CELL_CLASS;

export const STAFF_ROSTER_LIST_DATE_TIME_CELL = USER_LIST_DATE_CELL;

export const STAFF_ROSTER_LIST_ACTIONS_CELL = USER_LIST_ACTIONS_CELL;

export const STAFF_ROSTER_LIST_EMPHASIZED_HEADER = ADMIN_LIST_EMPHASIZED_HEADER;
