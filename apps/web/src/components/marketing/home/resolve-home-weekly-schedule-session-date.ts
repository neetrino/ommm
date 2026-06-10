import {
  addDays,
  startOfLocalDay,
  startOfWeekSunday,
} from "@/components/marketing/schedule/schedule-date-utils";
import type {
  MarketingScheduleDayOfWeek,
  MarketingScheduleItem,
} from "@/components/marketing/schedule/marketing-schedule-types";

const DAY_TO_OFFSET: Record<MarketingScheduleDayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

/** Resolves the calendar day shown on home weekly schedule session cards. */
export function resolveHomeWeeklyScheduleSessionDate(
  item: MarketingScheduleItem,
  now: Date = new Date(),
): Date {
  if (item.sessionDate !== null) {
    return startOfLocalDay(new Date(item.sessionDate));
  }

  const weekStart = startOfWeekSunday(now);
  return addDays(weekStart, DAY_TO_OFFSET[item.dayOfWeek]);
}
