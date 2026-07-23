import { REALTIME_EVENT_NAMES, type ParsedRealtimeEvent } from "@/lib/realtime/realtime-event-types";

export const REALTIME_REFETCH_KEYS = {
  SCHEDULE_PUBLIC: "schedule/public",
  BOOKINGS_ME: "bookings/me",
  WAITLIST_ME: "waitlist/me",
  PACKAGES_ME: "packages/me",
  SCHEDULE_ADMIN: "classes/admin/sessions",
  BOOKINGS_ADMIN: "bookings/admin",
  WAITLIST_ADMIN: "waitlist/admin",
} as const;

export type RealtimeRefetchKey =
  (typeof REALTIME_REFETCH_KEYS)[keyof typeof REALTIME_REFETCH_KEYS];

export const REALTIME_REFETCH_DEBOUNCE_MS = 200;

/** Maps thin SSE events to REST refetch registry keys (deduped). */
export function refetchKeysForEvent(event: ParsedRealtimeEvent): RealtimeRefetchKey[] {
  switch (event.type) {
    case REALTIME_EVENT_NAMES.SCHEDULE_INVALIDATE:
    case REALTIME_EVENT_NAMES.SESSION_CHANGED:
    case REALTIME_EVENT_NAMES.CANCEL_INTENT_CHANGED:
      return [
        REALTIME_REFETCH_KEYS.SCHEDULE_PUBLIC,
        REALTIME_REFETCH_KEYS.SCHEDULE_ADMIN,
      ];
    case REALTIME_EVENT_NAMES.BOOKING_CHANGED:
      return [
        REALTIME_REFETCH_KEYS.BOOKINGS_ME,
        REALTIME_REFETCH_KEYS.SCHEDULE_PUBLIC,
        REALTIME_REFETCH_KEYS.PACKAGES_ME,
        REALTIME_REFETCH_KEYS.BOOKINGS_ADMIN,
        REALTIME_REFETCH_KEYS.WAITLIST_ADMIN,
      ];
    case REALTIME_EVENT_NAMES.WAITLIST_CHANGED:
    case REALTIME_EVENT_NAMES.WAITLIST_OFFER:
      return [
        REALTIME_REFETCH_KEYS.WAITLIST_ME,
        REALTIME_REFETCH_KEYS.WAITLIST_ADMIN,
      ];
    default:
      return [];
  }
}
