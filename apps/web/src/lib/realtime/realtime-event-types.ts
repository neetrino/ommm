/** Mirrors `apps/api/src/realtime/realtime.types.ts` event catalog (plan §2.2). */

export const REALTIME_EVENT_NAMES = {
  SCHEDULE_INVALIDATE: "schedule.invalidate",
  BOOKING_CHANGED: "booking.changed",
  WAITLIST_CHANGED: "waitlist.changed",
  WAITLIST_OFFER: "waitlist.offer",
  SESSION_CHANGED: "session.changed",
  DASHBOARD_INVALIDATE: "dashboard.invalidate",
  CANCEL_INTENT_CHANGED: "cancel-intent.changed",
} as const;

export type RealtimeEventName =
  (typeof REALTIME_EVENT_NAMES)[keyof typeof REALTIME_EVENT_NAMES];

export type ParsedRealtimeEvent = {
  type: RealtimeEventName;
  data: Record<string, unknown>;
};

export const REALTIME_SSE_EVENT_NAMES: readonly RealtimeEventName[] = [
  REALTIME_EVENT_NAMES.SCHEDULE_INVALIDATE,
  REALTIME_EVENT_NAMES.BOOKING_CHANGED,
  REALTIME_EVENT_NAMES.WAITLIST_CHANGED,
  REALTIME_EVENT_NAMES.WAITLIST_OFFER,
  REALTIME_EVENT_NAMES.SESSION_CHANGED,
  REALTIME_EVENT_NAMES.DASHBOARD_INVALIDATE,
  REALTIME_EVENT_NAMES.CANCEL_INTENT_CHANGED,
];
