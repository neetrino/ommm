export const CLIENT_SHEET_TAB_PROFILE = "profile";
export const CLIENT_SHEET_TAB_BOOKINGS = "bookings";
export const CLIENT_SHEET_TAB_PAYMENTS = "payments";
export const CLIENT_SHEET_TAB_GIFTS = "gifts";
export const CLIENT_SHEET_TAB_NOTES = "notes";

export type ClientSheetTabId =
  | typeof CLIENT_SHEET_TAB_PROFILE
  | typeof CLIENT_SHEET_TAB_BOOKINGS
  | typeof CLIENT_SHEET_TAB_PAYMENTS
  | typeof CLIENT_SHEET_TAB_GIFTS
  | typeof CLIENT_SHEET_TAB_NOTES;

export const CLIENT_SHEET_TAB_ORDER: readonly ClientSheetTabId[] = [
  CLIENT_SHEET_TAB_PROFILE,
  CLIENT_SHEET_TAB_BOOKINGS,
  CLIENT_SHEET_TAB_PAYMENTS,
  CLIENT_SHEET_TAB_GIFTS,
  CLIENT_SHEET_TAB_NOTES,
];
