import {
  ADMIN_CARD_CONTAIN_CLASS,
  ADMIN_LIST_EMPHASIZED_HEADER,
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
import managersListLayoutStyles from "@/components/admin/admin-managers-list-layout.module.css";

const ADMIN_MANAGERS_LIST_ROW_PAD = "max-md:px-4 max-md:pb-4 max-md:pt-5 md:px-6 md:py-5";
const ADMIN_MANAGERS_LIST_HEADER_PAD = "px-6 py-4";

export const ADMIN_MANAGERS_LIST_TABLE_CLASS = [
  ADMIN_CARD_CONTAIN_CLASS,
  "max-md:space-y-3",
  "md:grid",
  managersListLayoutStyles.tableEditable,
  USER_LIST_TABLE_GRID_GAP,
  "md:gap-y-4",
].join(" ");

export const ADMIN_MANAGERS_LIST_HEADER_CLASS = [
  "hidden",
  USER_LIST_TABLE_SUBGRID_ROW,
  USER_LIST_HEADER_SURFACE,
  ADMIN_MANAGERS_LIST_HEADER_PAD,
  USER_LIST_TABLE_HEADER_TEXT,
  "md:grid",
  "md:items-end",
].join(" ");

export const ADMIN_MANAGERS_LIST_ROW_CLASS = [
  ADMIN_LIST_ROW_SURFACE,
  USER_LIST_ROW_INTERACTIVE,
  "group relative overflow-x-visible overflow-y-visible",
  "grid w-full max-md:gap-3 text-left",
  ADMIN_MANAGERS_LIST_ROW_PAD,
  "md:col-span-full md:grid md:grid-cols-subgrid md:items-center md:gap-y-0",
  managersListLayoutStyles.row,
  managersListLayoutStyles.rowWithActions,
].join(" ");

export const ADMIN_MANAGERS_LIST_NAME_AREA_CLASS = managersListLayoutStyles.name;
export const ADMIN_MANAGERS_LIST_EMAIL_AREA_CLASS = managersListLayoutStyles.email;
export const ADMIN_MANAGERS_LIST_ACCESS_AREA_CLASS = managersListLayoutStyles.access;
export const ADMIN_MANAGERS_LIST_JOINED_AREA_CLASS = `${managersListLayoutStyles.joined} max-md:hidden`;
export const ADMIN_MANAGERS_LIST_ACTIONS_AREA_CLASS = managersListLayoutStyles.actions;

export const ADMIN_MANAGERS_LIST_ROW_ACTIONS_HOVER_REVEAL =
  ADMIN_LIST_ROW_ACTIONS_HOVER_REVEAL;

export const ADMIN_MANAGERS_LIST_CELL = USER_LIST_CELL_CLASS;

export const ADMIN_MANAGERS_LIST_NAME_CELL =
  "min-w-0 w-full max-w-full overflow-visible justify-self-stretch text-left";

export const ADMIN_MANAGERS_LIST_ACCESS_CELL =
  `${USER_LIST_CELL_CLASS} md:flex md:justify-center`;

export const ADMIN_MANAGERS_LIST_JOINED_CELL =
  `${USER_LIST_CELL_CLASS} tabular-nums md:text-center`;

export const ADMIN_MANAGERS_LIST_ACTIONS_CELL = USER_LIST_ACTIONS_CELL;

export const ADMIN_MANAGERS_LIST_ACTIONS_HEADER_CELL = USER_LIST_TRAILING_HEADER_CELL;

export const ADMIN_MANAGERS_LIST_EMPHASIZED_HEADER = ADMIN_LIST_EMPHASIZED_HEADER;

export const ADMIN_MANAGERS_LIST_SUBTITLE_CLASS = "mt-1 text-sm text-sage-500";

export const ADMIN_MANAGERS_ACCESS_BADGE_CLASS = [
  "inline-flex w-max max-w-full shrink-0 items-center rounded-full",
  "px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-2 ring-white",
].join(" ");
