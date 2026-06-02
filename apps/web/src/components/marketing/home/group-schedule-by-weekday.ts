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

/** Groups active schedule rows by weekday for the home weekly schedule day tabs. */
export function groupScheduleByWeekday(
  items: readonly MarketingScheduleItem[],
): ScheduleItemsByWeekday {
  const buckets = Object.fromEntries(
    HOME_WEEKLY_SCHEDULE_DAY_ORDER.map((day) => [day, [] as MarketingScheduleItem[]]),
  ) as Record<MarketingScheduleDayOfWeek, MarketingScheduleItem[]>;

  for (const item of items) {
    if (!item.isActive) {
      continue;
    }
    buckets[item.dayOfWeek].push(item);
  }

  for (const day of HOME_WEEKLY_SCHEDULE_DAY_ORDER) {
    buckets[day].sort(compareSessions);
  }

  return buckets;
}
