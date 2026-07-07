import {
  ADMIN_LIST_EMPHASIZED_HEADER,
  ADMIN_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_LIST_ROW_CLASS,
  USER_LIST_ACTIONS_CELL,
  USER_LIST_CELL_CLASS,
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

/** Desktop row height — avatar + name/phone block; keeps every client row uniform. */
const ADMIN_CLIENTS_LIST_ROW_HEIGHT_CLASS = "md:min-h-[4.5rem] md:overflow-visible";

export const ADMIN_CLIENTS_LIST_ROW_CLASS = [
  ADMIN_LIST_ROW_CLASS,
  ADMIN_CLIENTS_LIST_ROW_HEIGHT_CLASS,
].join(" ");

export const ADMIN_CLIENTS_LIST_ROW_ACTIONS_HOVER_REVEAL = ADMIN_LIST_ROW_ACTIONS_HOVER_REVEAL;

export const ADMIN_CLIENTS_LIST_CELL = USER_LIST_CELL_CLASS;

/** Name column — allow avatar tag ribbon to render above the icon without clipping. */
export const ADMIN_CLIENTS_LIST_NAME_CELL =
  "min-w-0 w-full max-w-full overflow-visible justify-self-stretch text-left";

export const ADMIN_CLIENTS_LIST_DATE_CELL = `${USER_LIST_CELL_CLASS} tabular-nums`;

export const ADMIN_CLIENTS_LIST_ACTIONS_CELL = USER_LIST_ACTIONS_CELL;

export const ADMIN_CLIENTS_LIST_ACTIONS_HEADER_CELL = USER_LIST_TRAILING_HEADER_CELL;

export const ADMIN_CLIENTS_LIST_EMPHASIZED_HEADER = ADMIN_LIST_EMPHASIZED_HEADER;
