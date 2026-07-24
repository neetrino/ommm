import {
  HOME_WEEKLY_SCHEDULE_DAY_ORDER,
  groupScheduleByWeekday,
} from "@/components/marketing/home/group-schedule-by-weekday";
import {
  getHomeWeeklyScheduleTabCalendarDate,
  resolveHomeWeeklyScheduleFocusDate,
} from "@/components/marketing/home/home-weekly-schedule-date.helpers";
import type { HomeWeeklyScheduleCompactDay } from "@/components/marketing/home/home-weekly-schedule-compact-view";
import type { MarketingScheduleDayOfWeek } from "@/components/marketing/schedule/marketing-schedule-types";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";

export type HomeWeeklyScheduleDayLabels = {
  emptyDay: string;
  day: (day: MarketingScheduleDayOfWeek) => string;
  bookSessionAria: (className: string) => string;
  withInstructor: (name: string) => string;
  duration: (count: number) => string;
  durationFallback: string;
  spotsLeft: (count: number) => string;
};

function formatDurationLabel(
  labels: HomeWeeklyScheduleDayLabels,
  item: MarketingScheduleItem,
): string {
  if (item.durationMinutes !== null) {
    return labels.duration(item.durationMinutes);
  }
  return labels.durationFallback;
}

/** Builds day-tab view model from schedule API rows. */
export function buildHomeWeeklyScheduleDays(
  items: readonly MarketingScheduleItem[],
  labels: HomeWeeklyScheduleDayLabels,
  reference: Date = new Date(),
): HomeWeeklyScheduleCompactDay[] {
  const focusDateIso = resolveHomeWeeklyScheduleFocusDate(items, reference);
  const byDay = groupScheduleByWeekday(items, reference);

  return HOME_WEEKLY_SCHEDULE_DAY_ORDER.map((day) => ({
    day,
    calendarDate: getHomeWeeklyScheduleTabCalendarDate(day, reference, focusDateIso),
    label: labels.day(day),
    emptyLabel: labels.emptyDay,
    sessions: byDay[day].map((item) => ({
      id: item.id,
      item,
      bookAriaLabel: labels.bookSessionAria(item.className),
      withInstructorLabel: labels.withInstructor(item.instructorName),
      durationLabel: formatDurationLabel(labels, item),
      spotsLeftLabel: labels.spotsLeft(item.availableSpots),
    })),
  }));
}
