/** Must match the cron batch cadence (`0,30 * * * *`). */
export const CLASS_REMINDER_TICK_MINUTES = 30;

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const TICK_MS = CLASS_REMINDER_TICK_MINUTES * MINUTE_MS;

/**
 * Floor onto the :00/:30 grid (epoch-aligned, same instants as Asia/Yerevan).
 * A tick that starts a few seconds late still owns the same sessions.
 */
export function snapClassReminderTick(now: Date): Date {
  return new Date(Math.floor(now.getTime() / TICK_MS) * TICK_MS);
}

/**
 * Sessions this tick must cover for `hoursBefore`:
 * `[tick + h - 30m, tick + h + 30m)`.
 *
 * The first half is catch-up for a missed run (already due, send now).
 * The second half is this run's slot, delivered at `startsAt - h`, not at the tick.
 * Sending at the tick made off-grid classes up to 30 minutes early (2.5h / 24.5h).
 */
export function classReminderSessionWindow(
  now: Date,
  hoursBefore: number,
): { start: Date; endExclusive: Date } {
  const dueSlotStart =
    snapClassReminderTick(now).getTime() + hoursBefore * HOUR_MS;
  return {
    start: new Date(dueSlotStart - TICK_MS),
    endExclusive: new Date(dueSlotStart + TICK_MS),
  };
}

/** Wait until `startsAt - hoursBefore`. Already-due reminders wait 0. */
export function classReminderDelayMs(
  now: Date,
  startsAt: Date,
  hoursBefore: number,
): number {
  const dueAt = startsAt.getTime() - hoursBefore * HOUR_MS;
  return Math.max(0, dueAt - now.getTime());
}

/** In-process timer id so a later tick can replace a pending send. */
export function classReminderScheduleKey(
  bookingId: string,
  hoursBefore: number,
): string {
  return `${bookingId}:${hoursBefore}`;
}
