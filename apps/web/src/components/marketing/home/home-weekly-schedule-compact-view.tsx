"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { HomeWeeklyScheduleSessionRow } from "@/components/marketing/home/home-weekly-schedule-session-row";
import {
  HOME_WEEKLY_SCHEDULE_DAY_CHIP_CLASS,
  HOME_WEEKLY_SCHEDULE_FIGMA,
  HOME_WEEKLY_SCHEDULE_LAYOUT,
} from "@/components/marketing/home/home-weekly-schedule-tokens";
import type { MarketingScheduleDayOfWeek } from "@/components/marketing/schedule/marketing-schedule-types";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

export type HomeWeeklyScheduleCompactDay = {
  day: MarketingScheduleDayOfWeek;
  label: string;
  emptyLabel: string;
  sessions: readonly {
    id: string;
    item: MarketingScheduleItem;
    bookAriaLabel: string;
    withInstructorLabel: string;
    durationLabel: string;
    spotsLeftLabel: string;
  }[];
};

type HomeWeeklyScheduleDayViewProps = {
  locale: string;
  days: readonly HomeWeeklyScheduleCompactDay[];
  initialDay: MarketingScheduleDayOfWeek;
};

export function HomeWeeklyScheduleDayView({
  locale,
  days,
  initialDay,
}: HomeWeeklyScheduleDayViewProps) {
  const t = useTranslations("marketingPublic.home");
  const [selectedDay, setSelectedDay] = useState<MarketingScheduleDayOfWeek>(initialDay);

  const activeDay =
    days.find((entry) => entry.day === selectedDay) ?? days[0] ?? null;

  const selectDay = useCallback((day: MarketingScheduleDayOfWeek) => {
    setSelectedDay(day);
  }, []);

  if (activeDay === null) {
    return null;
  }

  return (
    <div className={`${marketingMontserrat.className} w-full min-w-0`}>
      <div
        role="tablist"
        aria-label={t("weeklyScheduleDayTabsAria")}
        className="flex flex-wrap items-center justify-center"
        style={{ gap: HOME_WEEKLY_SCHEDULE_LAYOUT.dayTabGap }}
      >
        {days.map((entry) => {
          const isSelected = entry.day === selectedDay;
          const sessionCount = entry.sessions.length;
          return (
            <button
              key={entry.day}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={`home-weekly-schedule-panel-${entry.day}`}
              id={`home-weekly-schedule-tab-${entry.day}`}
              onClick={() => selectDay(entry.day)}
              className={`${HOME_WEEKLY_SCHEDULE_DAY_CHIP_CLASS} ${
                isSelected ? "font-extrabold" : "bg-transparent font-semibold"
              }`}
              style={{
                borderWidth: isSelected ? 0 : HOME_WEEKLY_SCHEDULE_FIGMA.dayChipBorderWidthPx,
                borderStyle: "solid",
                borderColor: HOME_WEEKLY_SCHEDULE_FIGMA.dayChipIdleBorder,
                color: isSelected
                  ? HOME_WEEKLY_SCHEDULE_FIGMA.dayChipActiveText
                  : HOME_WEEKLY_SCHEDULE_FIGMA.dayChipIdleText,
                backgroundColor: isSelected
                  ? HOME_WEEKLY_SCHEDULE_FIGMA.dayChipActiveFill
                  : "transparent",
              }}
              aria-label={t("weeklyScheduleDayTabAria", {
                day: entry.label,
                count: sessionCount,
              })}
            >
              {entry.label}
            </button>
          );
        })}
      </div>

      <div
        id={`home-weekly-schedule-panel-${activeDay.day}`}
        role="tabpanel"
        aria-labelledby={`home-weekly-schedule-tab-${activeDay.day}`}
        aria-label={t("weeklyScheduleSessionsPanelAria", { day: activeDay.label })}
        className="mt-6 flex w-full min-w-0 flex-col sm:mt-8"
        style={{ gap: HOME_WEEKLY_SCHEDULE_LAYOUT.sessionListGap }}
      >
        {activeDay.sessions.length === 0 ? (
          <div
            className="flex min-h-[6.4375rem] items-center justify-center rounded-[2rem] border border-dashed px-4 py-8 text-center text-sm font-semibold leading-6 sm:text-base"
            style={{
              borderColor: HOME_WEEKLY_SCHEDULE_FIGMA.dayChipIdleBorder,
              color: HOME_WEEKLY_SCHEDULE_FIGMA.scheduleInk,
              borderRadius: HOME_WEEKLY_SCHEDULE_LAYOUT.sessionRowRadius,
            }}
          >
            {activeDay.emptyLabel}
          </div>
        ) : (
          activeDay.sessions.map((session) => (
            <HomeWeeklyScheduleSessionRow
              key={session.id}
              item={session.item}
              locale={locale}
              reserveLabel={t("weeklyScheduleReserve")}
              withInstructorLabel={session.withInstructorLabel}
              durationLabel={session.durationLabel}
              spotsLeftLabel={session.spotsLeftLabel}
              bookAriaLabel={session.bookAriaLabel}
            />
          ))
        )}
      </div>
    </div>
  );
}
