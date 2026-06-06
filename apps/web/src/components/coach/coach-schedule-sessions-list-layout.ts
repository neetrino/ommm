import {
  ADMIN_LIST_EMPHASIZED_HEADER,
  ADMIN_LIST_ROW_SURFACE,
  buildAdminListHeaderClass,
  buildAdminListTableClass,
  USER_LIST_CELL_CLASS,
  USER_LIST_DATE_CELL,
  USER_LIST_TABLE_ROW_PAD,
} from "@/components/admin/admin-list-table-layout";

const COACH_SESSIONS_GRID_CLASS =
  "md:grid-cols-[minmax(0,1fr)_minmax(11rem,auto)_minmax(7rem,auto)_minmax(8.5rem,auto)_minmax(6.5rem,auto)]";

export const COACH_SCHEDULE_SESSIONS_LIST_TABLE_CLASS =
  buildAdminListTableClass(COACH_SESSIONS_GRID_CLASS);

export const COACH_SCHEDULE_SESSIONS_LIST_HEADER_CLASS = buildAdminListHeaderClass();

export const COACH_SCHEDULE_SESSIONS_LIST_ROW_CLASS = [
  ADMIN_LIST_ROW_SURFACE,
  "grid w-full grid-cols-1 gap-3 text-left",
  USER_LIST_TABLE_ROW_PAD,
  "md:col-span-full md:grid md:grid-cols-subgrid md:items-center md:gap-y-0",
].join(" ");

export const COACH_SCHEDULE_SESSIONS_LIST_CELL = USER_LIST_CELL_CLASS;

export const COACH_SCHEDULE_SESSIONS_LIST_DATE_TIME_CELL = USER_LIST_DATE_CELL;

export const COACH_SCHEDULE_SESSIONS_LIST_CAPACITY_CELL = `${USER_LIST_CELL_CLASS} tabular-nums`;

export const COACH_SCHEDULE_SESSIONS_LIST_TAGS_CELL = `${USER_LIST_CELL_CLASS} flex flex-wrap items-center gap-1.5`;

export const COACH_SCHEDULE_SESSIONS_LIST_STATUS_CELL = USER_LIST_CELL_CLASS;

export const COACH_SCHEDULE_SESSIONS_LIST_EMPHASIZED_HEADER =
  ADMIN_LIST_EMPHASIZED_HEADER;
