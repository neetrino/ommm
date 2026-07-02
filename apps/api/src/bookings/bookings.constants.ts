/** Neon/pooled DB: booking tx runs several round-trips; Prisma default 5s is too low. */
export const BOOKING_INTERACTIVE_TX_TIMEOUT_MS = 15_000;
