import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { PUBLIC_SCHEDULE_RANGE_DAYS } from "@/lib/public-schedule-constants";
import { isWithinPublicScheduleWindow } from "@/lib/schedule-session-range";

/** True while the session start time is still in the future. */
export function isUpcomingPublicScheduleSession(
  item: MarketingScheduleItem,
  reference = new Date(),
): boolean {
  if (item.sessionDate === null) {
    return false;
  }
  return new Date(item.sessionDate).getTime() > reference.getTime();
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
