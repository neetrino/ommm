import {
  addStudioCalendarDays,
  studioWallClockToUtc,
  utcToStudioCalendarDate,
  utcToStudioWallClockTime,
} from '../common/studio-timezone';

/** Inclusive start of the customer send window, studio wall clock. */
export const NOTIFICATION_SEND_WINDOW_START = '13:00';

/** Exclusive end of the customer send window, studio wall clock. */
export const NOTIFICATION_SEND_WINDOW_END = '21:00';

const SEND_WINDOW_START_MINUTES = 13 * 60;
const SEND_WINDOW_END_MINUTES = 21 * 60;

/**
 * Matches the :00/:30 cron batch. The last in-window tick must cover up to 21:00,
 * otherwise a due time between 20:30 and 21:00 waits until the next afternoon.
 */
const NOTIFICATION_CRON_STEP_MINUTES = 30;

const MINUTE_MS = 60 * 1000;

/** True from 13:00 inclusive through 21:00 exclusive in Asia/Yerevan. */
export function isWithinNotificationSendWindow(now: Date): boolean {
  const minutes = studioMinutesOfDay(now);
  return (
    minutes >= SEND_WINDOW_START_MINUTES && minutes < SEND_WINDOW_END_MINUTES
  );
}

/**
 * Latest due instant this tick may send.
 * Null outside 13:00–21:00 Yerevan: callers must skip the batch.
 */
export function notificationDueUntil(now: Date): Date | null {
  if (!isWithinNotificationSendWindow(now)) {
    return null;
  }
  const windowEnd = studioWallClockToUtc(
    utcToStudioCalendarDate(now),
    NOTIFICATION_SEND_WINDOW_END,
  );
  const coversTail =
    now.getTime() + NOTIFICATION_CRON_STEP_MINUTES * MINUTE_MS >=
    windowEnd.getTime();
  return coversTail ? windowEnd : now;
}

/** Start of the quiet period that rolls into the current daytime window (yesterday 21:00). */
export function notificationDueSince(now: Date): Date {
  const yesterday = addStudioCalendarDays(utcToStudioCalendarDate(now), -1);
  return studioWallClockToUtc(yesterday, NOTIFICATION_SEND_WINDOW_END);
}
function studioMinutesOfDay(now: Date): number {
  const [hourText, minuteText] = utcToStudioWallClockTime(now).split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (hour === 24) {
    return minute;
  }
  return hour * 60 + minute;
}
