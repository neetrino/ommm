"use client";

import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { HomeWeeklyScheduleSessionCard } from "@/components/marketing/home/home-weekly-schedule-session-card";
import {
  HOME_WEEKLY_SCHEDULE_COMPACT_CHIP_CLASS,
  HOME_WEEKLY_SCHEDULE_DAY_STRIP_CLASS,
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
  }[];
};

type HomeWeeklyScheduleCompactViewProps = {
  locale: string;
  days: readonly HomeWeeklyScheduleCompactDay[];
  initialDay: MarketingScheduleDayOfWeek;
};

export function HomeWeeklyScheduleCompactView({
  locale,
  days,
  initialDay,
}: HomeWeeklyScheduleCompactViewProps) {
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

  const panelStyle = {
    "--home-schedule-card-min-h": HOME_WEEKLY_SCHEDULE_LAYOUT.cardMinHeightCompact,
  } as CSSProperties;

  return (
    <div className={`${marketingMontserrat.className} lg:hidden`}>
      <div
        role="tablist"
        aria-label={t("weeklyScheduleDayTabsAria")}
        className={HOME_WEEKLY_SCHEDULE_DAY_STRIP_CLASS}
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
              className={`${HOME_WEEKLY_SCHEDULE_COMPACT_CHIP_CLASS} ${
                isSelected ? "font-bold shadow-sm" : "font-semibold"
              }`}
              style={{
                color: isSelected
                  ? HOME_WEEKLY_SCHEDULE_FIGMA.headingColor
                  : HOME_WEEKLY_SCHEDULE_FIGMA.scheduleInk,
                backgroundColor: isSelected
                  ? "rgba(255, 255, 255, 0.55)"
                  : "rgba(255, 255, 255, 0.2)",
                borderColor: isSelected
                  ? HOME_WEEKLY_SCHEDULE_FIGMA.headingColor
                  : HOME_WEEKLY_SCHEDULE_FIGMA.cardBorder,
              }}
              aria-label={t("weeklyScheduleDayTabAria", {
                day: entry.label,
                count: sessionCount,
              })}
            >
              <span className="w-full truncate text-center">{entry.label}</span>
              {sessionCount > 0 ? (
                <span
                  className="mt-0.5 block h-0.5 w-0.5 rounded-full sm:mt-1 sm:h-1 sm:w-1"
                  style={{ backgroundColor: HOME_WEEKLY_SCHEDULE_FIGMA.headingColor }}
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        id={`home-weekly-schedule-panel-${activeDay.day}`}
        role="tabpanel"
        aria-labelledby={`home-weekly-schedule-tab-${activeDay.day}`}
        aria-label={t("weeklyScheduleSessionsPanelAria", { day: activeDay.label })}
        className="mt-5 min-w-0 sm:mt-6"
        style={panelStyle}
      >
        {activeDay.sessions.length === 0 ? (
          <div
            className="flex min-h-[var(--home-schedule-card-min-h)] items-center justify-center rounded-[2.5rem] border border-dashed px-4 py-8 text-center text-sm font-semibold leading-6 sm:text-base"
            style={{
              borderColor: HOME_WEEKLY_SCHEDULE_FIGMA.cardBorder,
              color: HOME_WEEKLY_SCHEDULE_FIGMA.scheduleInk,
              borderRadius: HOME_WEEKLY_SCHEDULE_LAYOUT.cardRadius,
            }}
          >
            {activeDay.emptyLabel}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-x-4 md:gap-y-5">
            {activeDay.sessions.map((session) => (
              <HomeWeeklyScheduleSessionCard
                key={session.id}
                item={session.item}
                locale={locale}
                bookAriaLabel={session.bookAriaLabel}
                variant="compact"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

