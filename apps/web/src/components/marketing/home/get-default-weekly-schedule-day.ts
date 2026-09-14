import {
  resolveHomeWeeklyScheduleFocusDate,
  studioCalendarDateToDayOfWeek,
} from "@/components/marketing/home/home-weekly-schedule-date.helpers";
import type { MarketingScheduleDayOfWeek } from "@/components/marketing/schedule/marketing-schedule-types";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { utcToStudioDayOfWeek } from "@/lib/studio-timezone";

/**
 * Defaults the compact schedule to the weekday of the nearest upcoming session
 * inside the rolling today…today+6 window. Falls back to studio today otherwise.
 */
export function getDefaultWeeklyScheduleDay(
  items: readonly Pick<MarketingScheduleItem, "sessionDate" | "isActive">[] = [],
  now: Date = new Date(),
): MarketingScheduleDayOfWeek {
  if (items.length === 0) {
    return utcToStudioDayOfWeek(now);
  }

  const focusDateIso = resolveHomeWeeklyScheduleFocusDate(items, now);
  return studioCalendarDateToDayOfWeek(focusDateIso);
}
