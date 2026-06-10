import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { startOfLocalDay } from "@/components/marketing/schedule/schedule-date-utils";
import { PUBLIC_SCHEDULE_RANGE_DAYS } from "@/lib/public-schedule-constants";
import { isWithinPublicScheduleWindow } from "@/lib/schedule-session-range";

/**
 * Resolves when a public schedule row starts using the same wall-clock fields shown in UI
 * (`sessionDate` calendar day + API `startTime` HH:mm).
 */
export function resolvePublicScheduleSessionStart(
  item: Pick<MarketingScheduleItem, "sessionDate" | "startTime">,
): Date | null {
  if (item.sessionDate === null) {
    return null;
  }

  const [hourPart, minutePart] = item.startTime.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return new Date(item.sessionDate);
  }

  const day = startOfLocalDay(new Date(item.sessionDate));
  day.setHours(hour, minute, 0, 0);
  return day;
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
