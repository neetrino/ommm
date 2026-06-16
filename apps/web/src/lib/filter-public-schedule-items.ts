import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { PUBLIC_SCHEDULE_RANGE_DAYS } from "@/lib/public-schedule-constants";
import {
  addStudioCalendarDays,
  resolveStudioCalendarDateFromSessionDate,
  studioWallClockToUtc,
  utcToStudioCalendarDate,
} from "@/lib/studio-timezone";

/**
 * Resolves when a public schedule row starts using studio wall-clock fields
 * (`sessionDate` calendar day + API `startTime` HH:mm).
 */
export function resolvePublicScheduleSessionStart(
  item: Pick<MarketingScheduleItem, "sessionDate" | "startTime">,
): Date | null {
  if (item.sessionDate === null) {
    return null;
  }

  const calendarDate = resolveStudioCalendarDateFromSessionDate(item.sessionDate);
  if (calendarDate === null) {
    return null;
  }

  const timeMatch = /^(\d{2}):(\d{2})$/.exec(item.startTime.trim());
  if (timeMatch === null) {
    return new Date(item.sessionDate);
  }

  return studioWallClockToUtc(calendarDate, item.startTime);
}

/** True while the displayed session start time is still in the future. */
export function isUpcomingPublicScheduleSession(
  item: MarketingScheduleItem,
  reference = new Date(),
): boolean {
  const start = resolvePublicScheduleSessionStart(item);
  if (start === null) {
    return false;
  }
  return start.getTime() > reference.getTime();
}

/** Public marketing rows that are still bookable (in window and not yet started). */
export function filterBookablePublicScheduleItems(
  items: readonly MarketingScheduleItem[],
  reference = new Date(),
  rangeDays: number = PUBLIC_SCHEDULE_RANGE_DAYS,
): MarketingScheduleItem[] {
  return items.filter(
    (item) =>
      item.isActive &&
      item.sessionDate !== null &&
      isWithinPublicScheduleWindow(item.sessionDate, rangeDays, reference) &&
      isUpcomingPublicScheduleSession(item, reference),
  );
}

/** Keeps only sessions whose studio calendar day falls inside the rolling public window. */
export function isWithinPublicScheduleWindow(
  sessionDateIso: string,
  rangeDays: number = PUBLIC_SCHEDULE_RANGE_DAYS,
  referenceDate: Date = new Date(),
): boolean {
  const sessionDay = resolveStudioCalendarDateFromSessionDate(sessionDateIso);
  if (sessionDay === null) {
    return false;
  }

  const today = utcToStudioCalendarDate(referenceDate);
  const maxDay = addStudioCalendarDays(today, rangeDays);
  return sessionDay >= today && sessionDay <= maxDay;
}
