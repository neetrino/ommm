import {
  ADMIN_LIST_EMPHASIZED_HEADER,
  ADMIN_LIST_ROW_CLASS,
  USER_LIST_ACTIONS_CELL,
  USER_LIST_CELL_CLASS,
  USER_LIST_SPACER_CELL,
  USER_LIST_TRAILING_HEADER_CELL,
  buildAdminListHeaderClass,
  buildAdminListTableClass,
} from "@/components/admin/admin-list-table-layout";

const COACHES_GRID_CLASS =
  "md:grid-cols-[minmax(0,1fr)_minmax(9rem,auto)_minmax(8.5rem,auto)_minmax(7.5rem,auto)_1fr_auto]";

const COACHES_GRID_READONLY_CLASS =
  "md:grid-cols-[minmax(0,1fr)_minmax(9rem,auto)_minmax(8.5rem,auto)_minmax(7.5rem,auto)]";

export const ADMIN_COACHES_LIST_TABLE_CLASS = buildAdminListTableClass(COACHES_GRID_CLASS);

export const ADMIN_COACHES_LIST_TABLE_READONLY_CLASS = buildAdminListTableClass(
  COACHES_GRID_READONLY_CLASS,
);

export const ADMIN_COACHES_LIST_HEADER_CLASS = buildAdminListHeaderClass();

export const ADMIN_COACHES_LIST_ROW_CLASS = ADMIN_LIST_ROW_CLASS;

export const ADMIN_COACHES_LIST_CELL = USER_LIST_CELL_CLASS;

export const ADMIN_COACHES_LIST_TAGS_CELL = `${USER_LIST_CELL_CLASS} flex flex-wrap items-center gap-1.5`;

export const ADMIN_COACHES_LIST_WORKLOAD_CELL = `${USER_LIST_CELL_CLASS} tabular-nums`;

export const ADMIN_COACHES_LIST_ACTIONS_CELL = USER_LIST_ACTIONS_CELL;

export const ADMIN_COACHES_LIST_ACTIONS_HEADER_CELL = USER_LIST_TRAILING_HEADER_CELL;

export const ADMIN_COACHES_LIST_SPACER_CELL = USER_LIST_SPACER_CELL;

export const ADMIN_COACHES_LIST_EMPHASIZED_HEADER = ADMIN_LIST_EMPHASIZED_HEADER;
