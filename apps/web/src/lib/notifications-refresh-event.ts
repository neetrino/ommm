export const NOTIFICATIONS_REFRESH_EVENT = "ommm:notifications-refresh";

/** Signals header notification menus to refetch waitlist offers. */
export function dispatchNotificationsRefresh(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_REFRESH_EVENT));
}
