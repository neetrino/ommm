/** Neon/pooled DB: booking tx runs several round-trips; Prisma default 5s is too low. */
export const BOOKING_INTERACTIVE_TX_TIMEOUT_MS = 15_000;

/** When true, a cron job auto-completes past BOOKED sessions every 10 minutes. */
export const ENABLE_BOOKING_BACKGROUND_JOBS_ENV = 'ENABLE_BOOKING_BACKGROUND_JOBS';
