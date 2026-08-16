import {
  ADMIN_LIST_EMPHASIZED_HEADER,
  ADMIN_LIST_ROW_CLASS,
  USER_LIST_CELL_CLASS,
  buildAdminListHeaderClass,
  buildAdminListTableClass,
} from "@/components/admin/admin-list-table-layout";

const CALL_TASKS_GRID_CLASS =
  "md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)_minmax(0,0.7fr)_minmax(0,1.4fr)_auto]";

export const ADMIN_CALL_TASKS_LIST_TABLE_CLASS = buildAdminListTableClass(CALL_TASKS_GRID_CLASS);

export const ADMIN_CALL_TASKS_LIST_HEADER_CLASS = buildAdminListHeaderClass();

export const ADMIN_CALL_TASKS_LIST_ROW_CLASS = ADMIN_LIST_ROW_CLASS;

export const ADMIN_CALL_TASKS_LIST_CELL = USER_LIST_CELL_CLASS;

export const ADMIN_CALL_TASKS_LIST_EMPHASIZED_HEADER = ADMIN_LIST_EMPHASIZED_HEADER;
