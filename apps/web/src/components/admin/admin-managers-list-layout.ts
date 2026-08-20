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
import managersListLayoutStyles from "@/components/admin/admin-managers-list-layout.module.css";

export const ADMIN_MANAGERS_LIST_TABLE_CLASS = buildAdminListTableClass(
  managersListLayoutStyles.tableEditable,
);

export const ADMIN_MANAGERS_LIST_HEADER_CLASS = buildAdminListHeaderClass();

export const ADMIN_MANAGERS_LIST_ROW_CLASS = ADMIN_LIST_ROW_CLASS;

export const ADMIN_MANAGERS_LIST_ROW_ACTIONS_HOVER_REVEAL =
  ADMIN_LIST_ROW_ACTIONS_HOVER_REVEAL;

export const ADMIN_MANAGERS_LIST_CELL = USER_LIST_CELL_CLASS;

export const ADMIN_MANAGERS_LIST_ACTIONS_CELL = USER_LIST_ACTIONS_CELL;

export const ADMIN_MANAGERS_LIST_ACTIONS_HEADER_CELL = USER_LIST_TRAILING_HEADER_CELL;

export const ADMIN_MANAGERS_LIST_EMPHASIZED_HEADER = ADMIN_LIST_EMPHASIZED_HEADER;
