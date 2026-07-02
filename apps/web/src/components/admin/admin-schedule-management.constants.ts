import type { ScheduleDayOfWeek, SessionStatus } from "@/components/admin/admin-schedule-session.types";

export const STATUS_OPTIONS: readonly SessionStatus[] = ["DRAFT", "ACTIVE", "FULL", "CANCELLED"];

export const SCHEDULE_WEEKDAYS: readonly ScheduleDayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export const SEARCH_DEBOUNCE_MS = 300;
export const ADMIN_SCHEDULE_TOAST_DISMISS_MS = 5000;
export const SCHEDULE_MODAL_QUERY_KEY = "modal";
export const ADD_CLASS_MODAL_QUERY_VALUE = "add-class";
export const LEGACY_CLASS_TYPES_MODAL_QUERY_VALUE = "class-types";
export const LEGACY_EDIT_CLASS_TYPE_QUERY_KEY = "editClassType";
export const SESSION_LEVEL_SEPARATOR = ", ";
export const DEFAULT_SESSION_CAPACITY = "10";
