export const SESSION_SHEET_TAB_DETAILS = "details";
export const SESSION_SHEET_TAB_BOOKINGS = "bookings";

export type SessionSheetTabId =
  | typeof SESSION_SHEET_TAB_DETAILS
  | typeof SESSION_SHEET_TAB_BOOKINGS;

export const SESSION_SHEET_TAB_ORDER: readonly SessionSheetTabId[] = [
  SESSION_SHEET_TAB_DETAILS,
  SESSION_SHEET_TAB_BOOKINGS,
];
