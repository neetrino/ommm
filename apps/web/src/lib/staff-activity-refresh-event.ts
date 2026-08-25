export const STAFF_ACTIVITY_REFRESH_EVENT = "ommm:staff-activity-refresh";

export function dispatchStaffActivityRefresh(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(STAFF_ACTIVITY_REFRESH_EVENT));
}
