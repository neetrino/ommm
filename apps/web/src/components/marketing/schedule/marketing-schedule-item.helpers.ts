import {
  addDays,
  startOfLocalDay,
  startOfWeekSunday,
} from "@/components/marketing/schedule/schedule-date-utils";
import type {
  MarketingScheduleDayOfWeek,
  MarketingScheduleItem,
} from "@/components/marketing/schedule/marketing-schedule-types";

export function mapMarketingScheduleDayToDate(
  weekStart: Date,
  day: MarketingScheduleDayOfWeek,
  dayToOffset: Record<MarketingScheduleDayOfWeek, number>,
): Date {
  return addDays(weekStart, dayToOffset[day]);
}

export function calendarDateToMarketingLocalDay(dateIso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso.trim());
  if (match === null) {
    return startOfLocalDay(new Date(dateIso));
  }
  return startOfLocalDay(
    new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
}

export function marketingScheduleItemDate(
  item: MarketingScheduleItem,
  baselineWeekStart: Date,
  dayToOffset: Record<MarketingScheduleDayOfWeek, number>,
): Date {
  if (item.sessionDate !== null) {
    return calendarDateToMarketingLocalDay(item.sessionDate);
  }
  return mapMarketingScheduleDayToDate(baselineWeekStart, item.dayOfWeek, dayToOffset);
}

export function marketingScheduleDayToOffset(): Record<MarketingScheduleDayOfWeek, number> {
  return {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };
}

export { startOfWeekSunday };
