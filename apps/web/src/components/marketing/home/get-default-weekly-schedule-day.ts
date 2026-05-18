import type { MarketingScheduleDayOfWeek } from "@/components/marketing/schedule/marketing-schedule-types";

const JS_WEEKDAY_TO_SCHEDULE_DAY: Record<number, MarketingScheduleDayOfWeek> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

/** Defaults the compact schedule to the visitor's current weekday. */
export function getDefaultWeeklyScheduleDay(
  now: Date = new Date(),
): MarketingScheduleDayOfWeek {
  return JS_WEEKDAY_TO_SCHEDULE_DAY[now.getDay()] ?? "MONDAY";
}
