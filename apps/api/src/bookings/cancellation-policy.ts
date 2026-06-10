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

/**
 * Penalized when cancellation occurs less than `penaltyHours` before class start.
 * At exactly `penaltyHours` before start, cancellation remains free.
 */
export function isPenalizedCancellation(
  sessionStartsAt: Date,
  penaltyHours: number,
  now: Date = new Date(),
): boolean {
  const freeCancelDeadline = new Date(sessionStartsAt);
  freeCancelDeadline.setHours(freeCancelDeadline.getHours() - penaltyHours);
  return now > freeCancelDeadline;
}
