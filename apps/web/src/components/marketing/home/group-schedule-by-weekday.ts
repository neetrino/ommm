import {
  listHomeWeeklyScheduleRollingTabs,
  resolveHomeWeeklyScheduleItemCalendarDate,
} from "@/components/marketing/home/home-weekly-schedule-date.helpers";
import type {
  MarketingScheduleDayOfWeek,
  MarketingScheduleItem,
} from "@/components/marketing/schedule/marketing-schedule-types";

/** Mon–Sun enum order used to initialize empty weekday buckets. */
const WEEKDAY_BUCKET_KEYS: readonly MarketingScheduleDayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

/**
 * @deprecated Prefer `listHomeWeeklyScheduleRollingTabs` — home tabs are rolling from today.
 */
export const HOME_WEEKLY_SCHEDULE_DAY_ORDER = WEEKDAY_BUCKET_KEYS;

export type ScheduleItemsByWeekday = Record<
  MarketingScheduleDayOfWeek,
  readonly MarketingScheduleItem[]
>;

function compareSessions(a: MarketingScheduleItem, b: MarketingScheduleItem): number {
  return a.startTime.localeCompare(b.startTime);
}

function emptyWeekdayBuckets(): Record<MarketingScheduleDayOfWeek, MarketingScheduleItem[]> {
  return Object.fromEntries(
    WEEKDAY_BUCKET_KEYS.map((day) => [day, [] as MarketingScheduleItem[]]),
  ) as Record<MarketingScheduleDayOfWeek, MarketingScheduleItem[]>;
}

/**
 * Groups active schedule rows into rolling weekday tabs (studio today … today+6).
 * Sessions outside that window are omitted from the home weekly schedule.
 */
export function groupScheduleByWeekday(
  items: readonly MarketingScheduleItem[],
  reference: Date = new Date(),
): ScheduleItemsByWeekday {
  const tabs = listHomeWeeklyScheduleRollingTabs(reference);
  const buckets = emptyWeekdayBuckets();

  for (const tab of tabs) {
    for (const item of items) {
      if (!item.isActive) {
        continue;
      }

      const itemCalendarDate = resolveHomeWeeklyScheduleItemCalendarDate(
        item,
        reference,
        tab.calendarDate,
      );
      if (itemCalendarDate === tab.calendarDate) {
        buckets[tab.day].push(item);
      }
    }

    buckets[tab.day].sort(compareSessions);
  }

  return buckets;
}
