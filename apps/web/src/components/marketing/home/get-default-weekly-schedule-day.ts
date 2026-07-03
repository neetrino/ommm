import type { MarketingScheduleDayOfWeek } from "@/components/marketing/schedule/marketing-schedule-types";
import { utcToStudioDayOfWeek } from "@/lib/studio-timezone";

/** Defaults the compact schedule to the studio's current weekday. */
export function getDefaultWeeklyScheduleDay(
  now: Date = new Date(),
): MarketingScheduleDayOfWeek {
  return utcToStudioDayOfWeek(now);
}
