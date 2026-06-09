/** Maximum days ahead shown on the public marketing schedule (`/{locale}/schedule`). */
export const PUBLIC_SCHEDULE_RANGE_DAYS = 30;

/** Public schedule capacity poll interval while the browser tab is visible. */
export const SCHEDULE_LIVE_POLL_INTERVAL_MS = 2_000;

/** Re-evaluate started sessions so past rows drop off without a manual refresh. */
export const SCHEDULE_CLOCK_TICK_MS = 15_000;

/** Prevent the opening click from immediately confirming the cancel dialog. */
export const BOOKING_CANCEL_CONFIRM_DELAY_MS = 300;
