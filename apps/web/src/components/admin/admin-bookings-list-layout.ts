import {
  ADMIN_CARD_CONTAIN_CLASS,
  ADMIN_LIST_EMPHASIZED_HEADER,
  ADMIN_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_LIST_ROW_SURFACE,
  USER_LIST_ACTIONS_CELL,
  USER_LIST_CELL_CLASS,
  USER_LIST_HEADER_SURFACE,
  USER_LIST_STACK_CLASS,
  USER_LIST_TABLE_GRID_GAP,
  USER_LIST_TABLE_HEADER_TEXT,
  USER_LIST_TABLE_SUBGRID_ROW,
} from "@/components/admin/admin-list-table-layout";
import { USER_LIST_ROW_INTERACTIVE } from "@/components/account/user-list-table-layout";
import bookingsListLayoutStyles from "@/components/admin/admin-bookings-list-layout.module.css";

const ADMIN_BOOKINGS_LIST_ROW_PAD = "max-md:px-4 max-md:pb-4 max-md:pt-5 md:px-6 md:py-5";
const ADMIN_BOOKINGS_LIST_HEADER_PAD = "px-6 py-4";
const ADMIN_BOOKINGS_LIST_TABLE_ROW_GAP = "md:gap-y-4";
const ADMIN_BOOKINGS_LIST_MOBILE_STACK_GAP = "max-md:space-y-3";

export const ADMIN_BOOKINGS_LIST_TABLE_CLASS = [
  ADMIN_CARD_CONTAIN_CLASS,
  ADMIN_BOOKINGS_LIST_MOBILE_STACK_GAP,
  "md:grid",
  bookingsListLayoutStyles.table,
  USER_LIST_TABLE_GRID_GAP,
  ADMIN_BOOKINGS_LIST_TABLE_ROW_GAP,
].join(" ");

export const ADMIN_BOOKINGS_LIST_HEADER_CLASS = [
  "hidden",
  USER_LIST_TABLE_SUBGRID_ROW,
  USER_LIST_HEADER_SURFACE,
  ADMIN_BOOKINGS_LIST_HEADER_PAD,
  USER_LIST_TABLE_HEADER_TEXT,
  "md:grid",
  "md:items-end",
].join(" ");

export const ADMIN_BOOKINGS_LIST_ROW_CLASS = [
  ADMIN_LIST_ROW_SURFACE,
  USER_LIST_ROW_INTERACTIVE,
  "group relative overflow-x-visible overflow-y-visible",
  "grid w-full max-md:gap-3 text-left",
  ADMIN_BOOKINGS_LIST_ROW_PAD,
  "max-md:bg-gradient-to-br max-md:from-white max-md:via-white max-md:to-sand-100/40",
  "md:col-span-full md:grid md:grid-cols-subgrid md:items-center md:gap-y-0",
  bookingsListLayoutStyles.row,
  bookingsListLayoutStyles.rowWithActions,
].join(" ");

export const ADMIN_BOOKINGS_LIST_USER_AREA_CLASS = bookingsListLayoutStyles.user;
export const ADMIN_BOOKINGS_LIST_COACH_AREA_CLASS = `${bookingsListLayoutStyles.coach} max-md:hidden`;
export const ADMIN_BOOKINGS_LIST_CLASS_AREA_CLASS = bookingsListLayoutStyles.classType;
export const ADMIN_BOOKINGS_LIST_DATETIME_AREA_CLASS = bookingsListLayoutStyles.datetime;
export const ADMIN_BOOKINGS_LIST_STATUS_AREA_CLASS = bookingsListLayoutStyles.status;
export const ADMIN_BOOKINGS_LIST_ACTIONS_AREA_CLASS = bookingsListLayoutStyles.actions;

export const ADMIN_BOOKINGS_LIST_ROW_ACTIONS_HOVER_REVEAL = ADMIN_LIST_ROW_ACTIONS_HOVER_REVEAL;

export const ADMIN_BOOKINGS_LIST_CELL = USER_LIST_CELL_CLASS;

export const ADMIN_BOOKINGS_LIST_USER_CELL =
  "min-w-0 w-full max-w-full overflow-visible justify-self-stretch text-left";

export const ADMIN_BOOKINGS_LIST_COACH_CELL = USER_LIST_CELL_CLASS;

export const ADMIN_BOOKINGS_LIST_DATE_TIME_CELL =
  "min-w-0 w-full max-w-full overflow-visible justify-self-stretch text-left tabular-nums";

export const ADMIN_BOOKINGS_LIST_BOOKING_STATUS_CELL = [
  USER_LIST_CELL_CLASS,
  "md:flex md:items-center",
].join(" ");

export const ADMIN_BOOKINGS_LIST_ACTIONS_CELL = USER_LIST_ACTIONS_CELL;

export const ADMIN_BOOKINGS_LIST_TITLE_CLASS =
  "block w-full min-w-0 text-left text-lg font-semibold leading-snug text-sage-900 underline-offset-2 hover:underline";

export const ADMIN_BOOKINGS_LIST_SUBTITLE_CLASS = "mt-1 text-sm text-sage-500";

export const ADMIN_BOOKINGS_LIST_COACH_MOBILE_CLASS = "mt-1 text-sm leading-snug text-sage-600";

export const ADMIN_BOOKINGS_LIST_PACKAGE_CLASS = "mt-1 text-[11px] leading-snug text-sage-500";

export const ADMIN_BOOKINGS_LIST_STACK_CLASS = USER_LIST_STACK_CLASS;

export const ADMIN_BOOKINGS_LIST_EMPHASIZED_HEADER = ADMIN_LIST_EMPHASIZED_HEADER;

export const ADMIN_BOOKINGS_LIST_HEADER_CELL = ADMIN_LIST_EMPHASIZED_HEADER;
