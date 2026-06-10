/** Maximum days ahead shown on the public marketing schedule (`/{locale}/schedule`). */
export const PUBLIC_SCHEDULE_RANGE_DAYS = 30;

/** Slow fallback poll while SSE is disconnected (plan §4.2). */
export const SCHEDULE_FALLBACK_POLL_MS = 60_000;

/** Re-evaluate started sessions so past rows drop off without a manual refresh. */
export const SCHEDULE_CLOCK_TICK_MS = 15_000;

/** Prevent the opening click from immediately confirming the cancel dialog. */
export const BOOKING_CANCEL_CONFIRM_DELAY_MS = 300;
