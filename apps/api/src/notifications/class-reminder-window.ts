/** Must match the cron batch cadence (`0,30 * * * *`). */
export const CLASS_REMINDER_TICK_MINUTES = 30;

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

/**
 * Sessions this tick must remind `hoursBefore` ahead: `[now + h, now + h + tick)`.
 * Consecutive ticks cover disjoint slots, so each booking falls into exactly one tick,
 * and the reminder is never late (at most one tick early). Runs around the clock.
 */
export function classReminderSessionWindow(
  now: Date,
  hoursBefore: number,
): { start: Date; endExclusive: Date } {
  const start = now.getTime() + hoursBefore * HOUR_MS;
  return {
    start: new Date(start),
    endExclusive: new Date(start + CLASS_REMINDER_TICK_MINUTES * MINUTE_MS),
  };
}
