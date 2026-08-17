export const CLIENT_SHEET_TAB_PROFILE = "profile";
export const CLIENT_SHEET_TAB_PACKAGES = "packages";
export const CLIENT_SHEET_TAB_BOOKINGS = "bookings";
export const CLIENT_SHEET_TAB_PAYMENTS = "payments";
export const CLIENT_SHEET_TAB_GIFTS = "gifts";
export const CLIENT_SHEET_TAB_FEEDBACK = "feedback";
export const CLIENT_SHEET_TAB_NOTES = "notes";

export const CLIENT_PROFILE_TAB_QUERY_KEY = "clientTab";
export const CLIENT_ADD_PACKAGE_QUERY_KEY = "clientAddPackage";
export const CLIENT_ADD_PACKAGE_QUERY_VALUE = "1";

export type ClientSheetTabId =
  | typeof CLIENT_SHEET_TAB_PROFILE
  | typeof CLIENT_SHEET_TAB_PACKAGES
  | typeof CLIENT_SHEET_TAB_BOOKINGS
  | typeof CLIENT_SHEET_TAB_PAYMENTS
  | typeof CLIENT_SHEET_TAB_GIFTS
  | typeof CLIENT_SHEET_TAB_FEEDBACK
  | typeof CLIENT_SHEET_TAB_NOTES;

export const CLIENT_SHEET_TAB_ORDER: readonly ClientSheetTabId[] = [
  CLIENT_SHEET_TAB_PROFILE,
  CLIENT_SHEET_TAB_PACKAGES,
  CLIENT_SHEET_TAB_BOOKINGS,
  CLIENT_SHEET_TAB_PAYMENTS,
  CLIENT_SHEET_TAB_GIFTS,
  CLIENT_SHEET_TAB_FEEDBACK,
  CLIENT_SHEET_TAB_NOTES,
];

const CLIENT_SHEET_TAB_IDS = new Set<string>(CLIENT_SHEET_TAB_ORDER);

/** Parses `clientTab` search param into a valid client sheet tab id. */
export function parseClientSheetTabId(value: string | null): ClientSheetTabId {
  if (value !== null && CLIENT_SHEET_TAB_IDS.has(value)) {
    return value as ClientSheetTabId;
  }
  return CLIENT_SHEET_TAB_PROFILE;
}
