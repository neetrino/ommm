import {
  ADMIN_LIST_EMPHASIZED_HEADER,
  ADMIN_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_LIST_ROW_CLASS,
  USER_LIST_CELL_CLASS,
  USER_LIST_DATE_CELL,
  USER_LIST_STACK_CLASS,
  buildAdminListHeaderClass,
  buildAdminListTableClass,
} from "@/components/admin/admin-list-table-layout";

/** User · Coach · Class · Date/time · Payment · Status · Actions. */
const BOOKINGS_GRID_CLASS =
  "md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,auto)_auto_auto_auto]";

export const ADMIN_BOOKINGS_LIST_TABLE_CLASS = buildAdminListTableClass(BOOKINGS_GRID_CLASS);

export const ADMIN_BOOKINGS_LIST_HEADER_CLASS = buildAdminListHeaderClass();

export const ADMIN_BOOKINGS_LIST_ROW_CLASS = ADMIN_LIST_ROW_CLASS;

export const ADMIN_BOOKINGS_LIST_ROW_ACTIONS_HOVER_REVEAL = ADMIN_LIST_ROW_ACTIONS_HOVER_REVEAL;

export const ADMIN_BOOKINGS_LIST_CELL = USER_LIST_CELL_CLASS;

export const ADMIN_BOOKINGS_LIST_COACH_CELL = USER_LIST_CELL_CLASS;

export const ADMIN_BOOKINGS_LIST_DATE_TIME_CELL = USER_LIST_DATE_CELL;

export const ADMIN_BOOKINGS_LIST_PAYMENT_CELL = USER_LIST_CELL_CLASS;

export const ADMIN_BOOKINGS_LIST_BOOKING_STATUS_CELL = [
  USER_LIST_CELL_CLASS,
  "md:flex md:items-center",
].join(" ");

export const ADMIN_BOOKINGS_LIST_ACTIONS_CELL = [
  USER_LIST_CELL_CLASS,
  "flex md:items-center",
].join(" ");

export const ADMIN_BOOKINGS_LIST_STACK_CLASS = USER_LIST_STACK_CLASS;

export const ADMIN_BOOKINGS_LIST_EMPHASIZED_HEADER = ADMIN_LIST_EMPHASIZED_HEADER;

export const ADMIN_BOOKINGS_LIST_HEADER_CELL = ADMIN_LIST_EMPHASIZED_HEADER;
