import {
  ADMIN_LIST_EMPHASIZED_HEADER,
  ADMIN_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_LIST_ROW_CLASS,
  USER_LIST_ACTIONS_CELL,
  USER_LIST_CELL_CLASS,
  USER_LIST_TRAILING_HEADER_CELL,
  buildAdminListHeaderClass,
  buildAdminListTableClass,
} from "@/components/admin/admin-list-table-layout";
import coachesListLayoutStyles from "@/components/admin/admin-coaches-list-layout.module.css";

export const ADMIN_COACHES_LIST_TABLE_CLASS = buildAdminListTableClass(
  coachesListLayoutStyles.tableEditable,
);

export const ADMIN_COACHES_LIST_TABLE_READONLY_CLASS = buildAdminListTableClass(
  coachesListLayoutStyles.tableReadOnly,
);

export const ADMIN_COACHES_LIST_HEADER_CLASS = buildAdminListHeaderClass();

export const ADMIN_COACHES_LIST_ROW_CLASS = ADMIN_LIST_ROW_CLASS;

export const ADMIN_COACHES_LIST_ROW_ACTIONS_HOVER_REVEAL = ADMIN_LIST_ROW_ACTIONS_HOVER_REVEAL;

export const ADMIN_COACHES_LIST_CELL = USER_LIST_CELL_CLASS;

export const ADMIN_COACHES_LIST_SPECIALIZATION_CELL = USER_LIST_CELL_CLASS;

export const ADMIN_COACHES_LIST_TAGS_CELL = [
  USER_LIST_CELL_CLASS,
  "flex flex-wrap content-start items-center gap-1.5",
].join(" ");

export const ADMIN_COACHES_LIST_WORKLOAD_CELL = [
  USER_LIST_CELL_CLASS,
  "tabular-nums whitespace-nowrap",
].join(" ");

export const ADMIN_COACHES_LIST_ACTIONS_CELL = USER_LIST_ACTIONS_CELL;

export const ADMIN_COACHES_LIST_ACTIONS_HEADER_CELL = USER_LIST_TRAILING_HEADER_CELL;

export const ADMIN_COACHES_LIST_EMPHASIZED_HEADER = ADMIN_LIST_EMPHASIZED_HEADER;
