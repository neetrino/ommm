export const REALTIME_EVENT_NAMES = {
  SCHEDULE_INVALIDATE: 'schedule.invalidate',
  BOOKING_CHANGED: 'booking.changed',
  WAITLIST_CHANGED: 'waitlist.changed',
  WAITLIST_OFFER: 'waitlist.offer',
  SESSION_CHANGED: 'session.changed',
  DASHBOARD_INVALIDATE: 'dashboard.invalidate',
  CANCEL_INTENT_CHANGED: 'cancel-intent.changed',
} as const;

export type RealtimeEventName =
  (typeof REALTIME_EVENT_NAMES)[keyof typeof REALTIME_EVENT_NAMES];

export type ScheduleInvalidatePayload = {
  sessionId?: string;
};

export type BookingChangedPayload = {
  userId: string;
  sessionId?: string;
};

export type WaitlistChangedPayload = {
  userId: string;
  sessionId?: string;
};

export type WaitlistOfferPayload = {
  userId: string;
  sessionId: string;
};

export type SessionChangedPayload = {
  sessionId: string;
};

export type CancelIntentChangedPayload = {
  sessionId: string;
};

export type DashboardInvalidatePayload = Record<string, never>;

export type PublicRealtimeEvent =
  | {
      type: typeof REALTIME_EVENT_NAMES.SCHEDULE_INVALIDATE;
      data: ScheduleInvalidatePayload;
    }
  | {
      type: typeof REALTIME_EVENT_NAMES.SESSION_CHANGED;
      data: SessionChangedPayload;
    }
  | {
      type: typeof REALTIME_EVENT_NAMES.CANCEL_INTENT_CHANGED;
      data: CancelIntentChangedPayload;
    };

export type PrivateRealtimeEvent =
  | {
      type: typeof REALTIME_EVENT_NAMES.BOOKING_CHANGED;
      data: BookingChangedPayload;
    }
  | {
      type: typeof REALTIME_EVENT_NAMES.WAITLIST_CHANGED;
      data: WaitlistChangedPayload;
    }
  | {
      type: typeof REALTIME_EVENT_NAMES.WAITLIST_OFFER;
      data: WaitlistOfferPayload;
    }
  | {
      type: typeof REALTIME_EVENT_NAMES.DASHBOARD_INVALIDATE;
      data: DashboardInvalidatePayload;
    };

export type RealtimeEvent = PublicRealtimeEvent | PrivateRealtimeEvent;

export type SseOutboundFrame = {
  id: string;
  event: RealtimeEventName;
  data: string;
};
