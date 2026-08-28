import {
  ADMIN_CARD_CONTAIN_CLASS,
  ADMIN_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_LIST_ROW_SURFACE,
  USER_LIST_ACTIONS_CELL,
  USER_LIST_CELL_CLASS,
  USER_LIST_HEADER_SURFACE,
  USER_LIST_TABLE_GRID_GAP,
  USER_LIST_TABLE_HEADER_TEXT,
  USER_LIST_TABLE_SUBGRID_ROW,
  USER_LIST_TRAILING_HEADER_CELL,
} from "@/components/admin/admin-list-table-layout";
import { USER_LIST_ROW_INTERACTIVE } from "@/components/account/user-list-table-layout";
import clientsListLayoutStyles from "@/components/admin/admin-clients-list-layout.module.css";

const ADMIN_CLIENTS_LIST_ROW_PAD = "max-md:px-4 max-md:pb-4 max-md:pt-5 md:px-6 md:py-5";
const ADMIN_CLIENTS_LIST_HEADER_PAD = "px-6 py-4";
const ADMIN_CLIENTS_LIST_TABLE_ROW_GAP = "md:gap-y-4";
const ADMIN_CLIENTS_LIST_MOBILE_STACK_GAP = "max-md:space-y-3";

function buildClientsListTableClass(gridClass: string): string {
  return [
    ADMIN_CARD_CONTAIN_CLASS,
    ADMIN_CLIENTS_LIST_MOBILE_STACK_GAP,
    "md:grid",
    gridClass,
    USER_LIST_TABLE_GRID_GAP,
    ADMIN_CLIENTS_LIST_TABLE_ROW_GAP,
  ].join(" ");
}

export const ADMIN_CLIENTS_LIST_TABLE_CLASS = buildClientsListTableClass(
  clientsListLayoutStyles.tableEditable,
);

export const ADMIN_CLIENTS_LIST_TABLE_READONLY_CLASS = buildClientsListTableClass(
  clientsListLayoutStyles.tableReadOnly,
);

export const ADMIN_CLIENTS_LIST_HEADER_CLASS = [
  "hidden",
  USER_LIST_TABLE_SUBGRID_ROW,
  USER_LIST_HEADER_SURFACE,
  ADMIN_CLIENTS_LIST_HEADER_PAD,
  USER_LIST_TABLE_HEADER_TEXT,
  "md:grid",
  "md:items-end",
].join(" ");

/** Desktop row height — avatar + name/phone block; keeps every client row uniform. */
const ADMIN_CLIENTS_LIST_ROW_HEIGHT_CLASS = "md:min-h-[5.5rem] md:overflow-visible";

export const ADMIN_CLIENTS_LIST_ROW_CLASS = [
  ADMIN_LIST_ROW_SURFACE,
  USER_LIST_ROW_INTERACTIVE,
  "group relative overflow-x-visible overflow-y-visible",
  "grid w-full max-md:gap-3 text-left",
  ADMIN_CLIENTS_LIST_ROW_PAD,
  "md:col-span-full md:grid md:grid-cols-subgrid md:items-center md:gap-y-0",
  ADMIN_CLIENTS_LIST_ROW_HEIGHT_CLASS,
  clientsListLayoutStyles.row,
].join(" ");

export const ADMIN_CLIENTS_LIST_ROW_WITH_ACTIONS_CLASS =
  clientsListLayoutStyles.rowWithActions;

export const ADMIN_CLIENTS_LIST_NAME_AREA_CLASS = clientsListLayoutStyles.name;
export const ADMIN_CLIENTS_LIST_BIRTHDAY_AREA_CLASS = `${clientsListLayoutStyles.birthday} max-md:hidden`;
export const ADMIN_CLIENTS_LIST_JOINED_AREA_CLASS = `${clientsListLayoutStyles.joined} max-md:hidden`;
export const ADMIN_CLIENTS_LIST_MEMBERSHIP_AREA_CLASS =
  clientsListLayoutStyles.membership;
export const ADMIN_CLIENTS_LIST_BOOKING_AREA_CLASS = clientsListLayoutStyles.booking;
export const ADMIN_CLIENTS_LIST_ACTIONS_AREA_CLASS = clientsListLayoutStyles.actions;

export const ADMIN_CLIENTS_LIST_ROW_ACTIONS_HOVER_REVEAL = ADMIN_LIST_ROW_ACTIONS_HOVER_REVEAL;

export const ADMIN_CLIENTS_LIST_CELL = USER_LIST_CELL_CLASS;

/** Name column — keep overflow visible so the avatar tag sits above the photo. */
export const ADMIN_CLIENTS_LIST_NAME_CELL =
  "min-w-0 w-full max-w-full overflow-visible justify-self-stretch text-left";

export const ADMIN_CLIENTS_LIST_DATE_CELL = `${USER_LIST_CELL_CLASS} tabular-nums`;

export const ADMIN_CLIENTS_LIST_TITLE_CLASS =
  "block w-full min-w-0 text-lg font-semibold leading-snug text-sage-900";

export const ADMIN_CLIENTS_LIST_SUBTITLE_CLASS =
  "mt-1 truncate text-sm text-sage-500";

export const ADMIN_CLIENTS_LIST_VALUE_CLASS = "text-base text-sage-800";

export const ADMIN_CLIENTS_LIST_ACTIONS_CELL = USER_LIST_ACTIONS_CELL;

export const ADMIN_CLIENTS_LIST_ACTIONS_HEADER_CELL = USER_LIST_TRAILING_HEADER_CELL;

export const ADMIN_CLIENTS_LIST_EMPHASIZED_HEADER =
  "text-xs font-semibold uppercase tracking-[0.1em] text-sage-600";
