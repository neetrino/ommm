const DEFAULT_CANCELLATION_PENALTY_HOURS = 24;

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
