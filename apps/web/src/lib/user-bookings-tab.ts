export const USER_BOOKINGS_TAB_PARAM = "tab";

export type UserBookingsTab = "past" | "perfect";

export const DEFAULT_USER_BOOKINGS_TAB: UserBookingsTab = "perfect";

export const USER_BOOKINGS_TABS: readonly UserBookingsTab[] = ["perfect", "past"];

/** Resolves the active My Bookings tab from URL search params. */
export function parseUserBookingsTab(
  search: Record<string, string | undefined>,
): UserBookingsTab {
  return search[USER_BOOKINGS_TAB_PARAM] === "past" ? "past" : DEFAULT_USER_BOOKINGS_TAB;
}
