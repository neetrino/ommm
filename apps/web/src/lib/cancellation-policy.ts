/** Matches backend default in `cancellation-policy.ts`. */
export const DEFAULT_CANCELLATION_PENALTY_HOURS = 24;

/**
 * Penalized when cancellation occurs less than `penaltyHours` before class start.
 * At exactly `penaltyHours` before start, cancellation remains free.
 */
export function isPenalizedCancellation(
  sessionStartsAt: Date,
  penaltyHours: number = DEFAULT_CANCELLATION_PENALTY_HOURS,
  now: Date = new Date(),
): boolean {
  const freeCancelDeadline = new Date(sessionStartsAt);
  freeCancelDeadline.setHours(freeCancelDeadline.getHours() - penaltyHours);
  return now > freeCancelDeadline;
}
