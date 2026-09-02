const DEFAULT_CANCELLATION_PENALTY_HOURS = 24;
const MS_PER_MINUTE = 60 * 1000;

/** Free cancel after an accidental book, even inside the late-cancel window. */
export const DEFAULT_CANCELLATION_GRACE_MINUTES = 15;

/**
 * Optional code override for the free-cancellation window (hours before class start).
 * `null` = use admin studio settings.
 */
export const CANCELLATION_PENALTY_HOURS_OVERRIDE: number | null = null;

/**
 * Hours before class start that separate free vs penalized member cancellation.
 */
export function resolveCancellationPenaltyHours(
  studioValue: number | null | undefined,
): number {
  if (CANCELLATION_PENALTY_HOURS_OVERRIDE !== null) {
    return CANCELLATION_PENALTY_HOURS_OVERRIDE;
  }
  return studioValue ?? DEFAULT_CANCELLATION_PENALTY_HOURS;
}

function sessionWallClockStartMs(startsAt: Date): number {
  return Date.UTC(
    startsAt.getUTCFullYear(),
    startsAt.getUTCMonth(),
    startsAt.getUTCDate(),
    startsAt.getUTCHours(),
    startsAt.getUTCMinutes(),
  );
}

function viewerWallClockNowMs(now: Date): number {
  return Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
  );
}

/**
 * Penalized when cancellation occurs less than `penaltyHours` before class start.
 * Compares studio wall-clock fields stored on `startsAt` with the viewer's local wall clock.
 */
export function isPenalizedCancellation(
  startsAt: Date,
  penaltyHours: number,
  now: Date = new Date(),
): boolean {
  const startMs = sessionWallClockStartMs(startsAt);
  const nowMs = viewerWallClockNowMs(now);
  const freeCancelDeadlineMs = startMs - penaltyHours * 60 * 60 * 1000;
  return nowMs > freeCancelDeadlineMs;
}

export function isWithinCancellationGracePeriod(
  bookingCreatedAt: Date,
  graceMinutes: number = DEFAULT_CANCELLATION_GRACE_MINUTES,
  now: Date = new Date(),
): boolean {
  return (
    now.getTime() - bookingCreatedAt.getTime() <= graceMinutes * MS_PER_MINUTE
  );
}

/**
 * Member late-cancel penalty, except when the booking was just created
 * (accidental book + immediate cancel must return the package session).
 */
export function shouldApplyCancellationPenalty(params: {
  startsAt: Date;
  bookingCreatedAt: Date;
  penaltyHours: number;
  now?: Date;
  graceMinutes?: number;
}): boolean {
  const now = params.now ?? new Date();
  const graceMinutes =
    params.graceMinutes ?? DEFAULT_CANCELLATION_GRACE_MINUTES;
  if (
    isWithinCancellationGracePeriod(params.bookingCreatedAt, graceMinutes, now)
  ) {
    return false;
  }
  return isPenalizedCancellation(params.startsAt, params.penaltyHours, now);
}
