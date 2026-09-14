import {
  USER_BOOKINGS_LIST_CLASS_CELL,
  USER_BOOKINGS_LIST_DATE_CELL,
  USER_BOOKINGS_LIST_HEADER_CLASS,
  USER_BOOKINGS_LIST_ROW_CLASS,
  USER_BOOKINGS_LIST_TABLE_CLASS,
} from "@/components/account/user-bookings-list-layout";
import { USER_LIST_CELL_CLASS, USER_LIST_TIME_CELL } from "@/components/account/user-list-table-layout";

export {
  USER_BOOKINGS_LIST_CLASS_CELL as USER_WAITLISTS_LIST_CLASS_CELL,
  USER_BOOKINGS_LIST_DATE_CELL as USER_WAITLISTS_LIST_DATE_CELL,
  USER_BOOKINGS_LIST_HEADER_CLASS as USER_WAITLISTS_LIST_HEADER_CLASS,
  USER_BOOKINGS_LIST_ROW_CLASS as USER_WAITLISTS_LIST_ROW_CLASS,
  USER_BOOKINGS_LIST_TABLE_CLASS as USER_WAITLISTS_LIST_TABLE_CLASS,
};

export const USER_WAITLISTS_LIST_CENTER_HEADER_CELL = "md:text-center";

export const USER_WAITLISTS_LIST_TIME_CELL = [
  USER_LIST_TIME_CELL,
  "md:flex md:justify-center",
].join(" ");

export const USER_WAITLISTS_LIST_STATUS_CELL = [
  USER_LIST_CELL_CLASS,
  "md:flex md:items-center md:justify-center md:text-center",
].join(" ");

export const USER_WAITLISTS_LIST_ACTIONS_CELL = [
  "min-w-0 w-full max-w-full justify-self-stretch overflow-visible",
  "md:flex md:items-center md:justify-center md:self-center",
].join(" ");
