import { resolvePublicScheduleSessionStart } from "@/lib/filter-public-schedule-items";
import { utcToStudioWallClockTime } from "@/lib/studio-timezone";

/** Matches backend default in `cancellation-policy.ts`. */
export const DEFAULT_CANCELLATION_PENALTY_HOURS = 24;

/** Formats studio wall-clock `HH:mm` from a session `startsAt` ISO instant. */
export function scheduleStartTimeFromIso(sessionDateIso: string): string {
  return utcToStudioWallClockTime(new Date(sessionDateIso));
}

/**
 * Penalized when cancellation occurs less than `penaltyHours` before the displayed class start.
 * Uses the same calendar day + wall time as the public schedule UI.
 */
export function isPenalizedCancellation(
  sessionDate: string,
  startTime: string,
  penaltyHours: number = DEFAULT_CANCELLATION_PENALTY_HOURS,
  now: Date = new Date(),
): boolean {
  const start = resolvePublicScheduleSessionStart({ sessionDate, startTime });
  if (start === null) {
    return false;
  }
  const freeCancelDeadlineMs = start.getTime() - penaltyHours * 60 * 60 * 1000;
  return now.getTime() > freeCancelDeadlineMs;
}

/** Convenience wrapper when only `startsAt` ISO is available (bookings API). */
export function isPenalizedCancellationFromIso(
  sessionStartsAtIso: string,
  penaltyHours: number = DEFAULT_CANCELLATION_PENALTY_HOURS,
  now: Date = new Date(),
): boolean {
  return isPenalizedCancellation(
    sessionStartsAtIso,
    scheduleStartTimeFromIso(sessionStartsAtIso),
    penaltyHours,
    now,
  );
}
