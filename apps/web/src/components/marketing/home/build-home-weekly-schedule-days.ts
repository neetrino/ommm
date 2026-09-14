import { groupScheduleByWeekday } from "@/components/marketing/home/group-schedule-by-weekday";
import { listHomeWeeklyScheduleRollingTabs } from "@/components/marketing/home/home-weekly-schedule-date.helpers";
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

/** Builds day-tab view model from schedule API rows (rolling today … today+6). */
export function buildHomeWeeklyScheduleDays(
  items: readonly MarketingScheduleItem[],
  labels: HomeWeeklyScheduleDayLabels,
  reference: Date = new Date(),
): HomeWeeklyScheduleCompactDay[] {
  const tabs = listHomeWeeklyScheduleRollingTabs(reference);
  const byDay = groupScheduleByWeekday(items, reference);

  return tabs.map((tab) => ({
    day: tab.day,
    calendarDate: tab.calendarDate,
    label: labels.day(tab.day),
    emptyLabel: labels.emptyDay,
    sessions: byDay[tab.day].map((item) => ({
      id: item.id,
      item,
      bookAriaLabel: labels.bookSessionAria(item.className),
      withInstructorLabel: labels.withInstructor(item.instructorName),
      durationLabel: formatDurationLabel(labels, item),
      spotsLeftLabel: labels.spotsLeft(item.availableSpots),
    })),
  }));
}
