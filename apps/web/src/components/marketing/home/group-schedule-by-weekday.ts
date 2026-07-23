import {
  getHomeWeeklyScheduleTabCalendarDate,
  resolveHomeWeeklyScheduleItemCalendarDate,
} from "@/components/marketing/home/home-weekly-schedule-date.helpers";
import type {
  MarketingScheduleDayOfWeek,
  MarketingScheduleItem,
} from "@/components/marketing/schedule/marketing-schedule-types";

/** Figma day tab order — MON through SUN (`196:1300`). */
export const HOME_WEEKLY_SCHEDULE_DAY_ORDER: readonly MarketingScheduleDayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export type ScheduleItemsByWeekday = Record<
  MarketingScheduleDayOfWeek,
  readonly MarketingScheduleItem[]
>;

function compareSessions(a: MarketingScheduleItem, b: MarketingScheduleItem): number {
  return a.startTime.localeCompare(b.startTime);
}

/** Groups active schedule rows by weekday tab for the current studio calendar week. */
export function groupScheduleByWeekday(
  items: readonly MarketingScheduleItem[],
  reference: Date = new Date(),
): ScheduleItemsByWeekday {
  const buckets = Object.fromEntries(
    HOME_WEEKLY_SCHEDULE_DAY_ORDER.map((day) => [day, [] as MarketingScheduleItem[]]),
  ) as Record<MarketingScheduleDayOfWeek, MarketingScheduleItem[]>;

  for (const day of HOME_WEEKLY_SCHEDULE_DAY_ORDER) {
    const tabCalendarDate = getHomeWeeklyScheduleTabCalendarDate(day, reference);

    for (const item of items) {
      if (!item.isActive) {
        continue;
      }

      const itemCalendarDate = resolveHomeWeeklyScheduleItemCalendarDate(item, reference);
      if (itemCalendarDate === tabCalendarDate) {
        buckets[day].push(item);
      }
    }

    buckets[day].sort(compareSessions);
  }

  return buckets;
}
