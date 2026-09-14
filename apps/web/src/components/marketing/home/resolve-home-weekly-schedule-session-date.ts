import { getHomeWeeklyScheduleTabCalendarDate } from "@/components/marketing/home/home-weekly-schedule-date.helpers";
import type {
  MarketingScheduleDayOfWeek,
  MarketingScheduleItem,
} from "@/components/marketing/schedule/marketing-schedule-types";
import { startOfLocalDay } from "@/components/marketing/schedule/schedule-date-utils";

/** Resolves the calendar day shown on home weekly schedule session cards. */
export function resolveHomeWeeklyScheduleSessionDate(
  item: MarketingScheduleItem,
  now: Date = new Date(),
): Date {
  if (item.sessionDate !== null) {
    const trimmed = item.sessionDate.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split("-").map(Number);
      return startOfLocalDay(new Date(year, month - 1, day));
    }
    return startOfLocalDay(new Date(item.sessionDate));
  }

  const calendarDate = getHomeWeeklyScheduleTabCalendarDate(item.dayOfWeek, now);
  const [year, month, day] = calendarDate.split("-").map(Number);
  return startOfLocalDay(new Date(year, month - 1, day));
}
