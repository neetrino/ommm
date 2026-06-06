import {
  ADMIN_LIST_EMPHASIZED_HEADER,
  ADMIN_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_LIST_ROW_CLASS,
  USER_LIST_ACTIONS_CELL,
  USER_LIST_CELL_CLASS,
  USER_LIST_SPACER_CELL,
  USER_LIST_TRAILING_HEADER_CELL,
  buildAdminListHeaderClass,
  USER_LIST_TABLE_GRID_GAP,
} from "@/components/admin/admin-list-table-layout";
import clientsListLayoutStyles from "@/components/admin/admin-clients-list-layout.module.css";

function buildClientsListTableClass(gridClass: string): string {
  return [
    "max-md:space-y-3",
    "md:grid",
    gridClass,
    USER_LIST_TABLE_GRID_GAP,
    "md:gap-y-3",
  ].join(" ");
}

export const ADMIN_CLIENTS_LIST_TABLE_CLASS = buildClientsListTableClass(
  clientsListLayoutStyles.tableEditable,
);

export const ADMIN_CLIENTS_LIST_TABLE_READONLY_CLASS = buildClientsListTableClass(
  clientsListLayoutStyles.tableReadOnly,
);

export const ADMIN_CLIENTS_LIST_HEADER_CLASS = buildAdminListHeaderClass();

export const ADMIN_CLIENTS_LIST_ROW_CLASS = ADMIN_LIST_ROW_CLASS;

export const ADMIN_CLIENTS_LIST_ROW_ACTIONS_HOVER_REVEAL = ADMIN_LIST_ROW_ACTIONS_HOVER_REVEAL;

export const ADMIN_CLIENTS_LIST_CELL = USER_LIST_CELL_CLASS;

export const ADMIN_CLIENTS_LIST_DATE_CELL = `${USER_LIST_CELL_CLASS} tabular-nums`;

export const ADMIN_CLIENTS_LIST_TAGS_CELL = `${USER_LIST_CELL_CLASS} flex flex-wrap items-center gap-1.5`;

export const ADMIN_CLIENTS_LIST_ACTIONS_CELL = USER_LIST_ACTIONS_CELL;

export const ADMIN_CLIENTS_LIST_ACTIONS_HEADER_CELL = USER_LIST_TRAILING_HEADER_CELL;

export const ADMIN_CLIENTS_LIST_SPACER_CELL = USER_LIST_SPACER_CELL;

export const ADMIN_CLIENTS_LIST_EMPHASIZED_HEADER = ADMIN_LIST_EMPHASIZED_HEADER;
