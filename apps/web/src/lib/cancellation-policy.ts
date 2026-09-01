import { resolvePublicScheduleSessionStart } from "@/lib/filter-public-schedule-items";
import {
  utcToStudioCalendarDate,
  utcToStudioWallClockTime,
} from "@/lib/studio-timezone";

/** Matches backend default in `cancellation-policy.ts`. */
export const DEFAULT_CANCELLATION_PENALTY_HOURS = 24;
/** Matches backend `DEFAULT_CANCELLATION_GRACE_MINUTES`. */
export const DEFAULT_CANCELLATION_GRACE_MINUTES = 15;
const MS_PER_MINUTE = 60 * 1000;

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
  const instant = new Date(sessionStartsAtIso);
  if (Number.isNaN(instant.getTime())) {
    return false;
  }
  return isPenalizedCancellation(
    utcToStudioCalendarDate(instant),
    utcToStudioWallClockTime(instant),
    penaltyHours,
    now,
  );
}

export function isWithinCancellationGracePeriod(
  bookedAtIso: string,
  graceMinutes: number = DEFAULT_CANCELLATION_GRACE_MINUTES,
  now: Date = new Date(),
): boolean {
  const bookedAtMs = Date.parse(bookedAtIso);
  if (Number.isNaN(bookedAtMs)) {
    return false;
  }
  return now.getTime() - bookedAtMs <= graceMinutes * MS_PER_MINUTE;
}

function looksLikeIsoInstant(value: string): boolean {
  return value.includes("T");
}

export function shouldApplyCancellationPenalty(params: {
  sessionDate: string;
  startTime: string;
  bookedAtIso?: string | null;
  penaltyHours?: number;
  now?: Date;
}): boolean {
  const now = params.now ?? new Date();
  if (
    params.bookedAtIso !== undefined &&
    params.bookedAtIso !== null &&
    isWithinCancellationGracePeriod(params.bookedAtIso, DEFAULT_CANCELLATION_GRACE_MINUTES, now)
  ) {
    return false;
  }
  if (looksLikeIsoInstant(params.sessionDate)) {
    return isPenalizedCancellationFromIso(
      params.sessionDate,
      params.penaltyHours,
      now,
    );
  }
  return isPenalizedCancellation(
    params.sessionDate,
    params.startTime,
    params.penaltyHours,
    now,
  );
}
