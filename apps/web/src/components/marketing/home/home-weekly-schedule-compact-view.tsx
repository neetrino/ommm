"use client";

import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import styles from "@/components/marketing/home/home-weekly-schedule-compact-view.module.css";
import { HomeWeeklyScheduleSessionRow } from "@/components/marketing/home/home-weekly-schedule-session-row";
import transitionStyles from "@/components/marketing/schedule/marketing-schedule-view.module.css";
import { useScheduleDayTransition } from "@/components/marketing/schedule/use-schedule-day-transition";
import {
  HOME_WEEKLY_SCHEDULE_DAY_CHIP_CLASS,
  HOME_WEEKLY_SCHEDULE_FIGMA,
  HOME_WEEKLY_SCHEDULE_LAYOUT,
  HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA,
  HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT,
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

  const visibleSessions = activeDay?.sessions ?? [];
  const {
    contentRef,
    renderedDayKey,
    renderedSessions,
    animationPhase,
    containerStyle,
    getItemStyle,
  } = useScheduleDayTransition({
    selectedDayKey: selectedDay,
    visibleSessions,
  });

  const renderedDay = useMemo(
    () => days.find((entry) => entry.day === renderedDayKey) ?? days[0] ?? null,
    [days, renderedDayKey],
  );

  const selectDay = useCallback((day: MarketingScheduleDayOfWeek) => {
    setSelectedDay(day);
  }, []);

  if (activeDay === null) {
    return null;
  }

  return (
    <div
      className={`${marketingMontserrat.className} ${styles.root}`}
      style={{
        ["--home-schedule-panel-gap" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.panelGap,
        ["--home-schedule-day-tabs-section-padding-top" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.dayTabsSectionPaddingTop,
        ["--home-schedule-day-tab-gap" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.dayTabGap,
        ["--home-schedule-day-tab-gap-lg" as string]: HOME_WEEKLY_SCHEDULE_LAYOUT.dayTabGap,
        ["--home-schedule-day-tab-list-height" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.dayTabListHeight,
        ["--home-schedule-day-tab-list-padding-bottom" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.dayTabListPaddingBottom,
        ["--home-schedule-day-tab-strip-min-width" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.dayTabStripMinWidth,
        ["--home-schedule-day-tab-height" as string]: HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.dayTabHeight,
        ["--home-schedule-day-tab-font-size" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.dayTabFontSize,
        ["--home-schedule-day-chip-border-width" as string]: `${HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA.dayChipBorderWidthPx}px`,
        ["--home-schedule-day-chip-border-width-lg" as string]: `${HOME_WEEKLY_SCHEDULE_FIGMA.dayChipBorderWidthPx}px`,
        ["--home-schedule-session-list-gap" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sessionListGap,
        ["--home-schedule-session-list-gap-lg" as string]:
          HOME_WEEKLY_SCHEDULE_LAYOUT.sessionListGap,
        ["--home-schedule-session-row-radius" as string]:
          HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sessionRowRadius,
        ["--home-schedule-session-row-radius-lg" as string]:
          HOME_WEEKLY_SCHEDULE_LAYOUT.sessionRowRadius,
        ["--home-schedule-day-chip-idle-border" as string]:
          HOME_WEEKLY_SCHEDULE_FIGMA.dayChipIdleBorder,
        ["--home-schedule-schedule-ink" as string]: HOME_WEEKLY_SCHEDULE_FIGMA.scheduleInk,
      }}
    >
      <div className={styles.dayTabsSection}>
        <div
          role="tablist"
          aria-label={t("weeklyScheduleDayTabsAria")}
          className={styles.dayTabList}
        >
          <div className={styles.dayTabTrack}>
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
                  className={`${HOME_WEEKLY_SCHEDULE_DAY_CHIP_CLASS} ${styles.dayTab} ${
                    isSelected ? "font-extrabold" : "bg-transparent font-semibold"
                  }`}
                  style={{
                    borderWidth: isSelected ? 0 : undefined,
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
        </div>
      </div>

      <div
        id={`home-weekly-schedule-panel-${activeDay.day}`}
        role="tabpanel"
        aria-labelledby={`home-weekly-schedule-tab-${activeDay.day}`}
        aria-label={t("weeklyScheduleSessionsPanelAria", { day: activeDay.label })}
        className={styles.sessionPanel}
      >
        <div
          className={styles.sessionPanelViewport}
          style={containerStyle}
        >
          <div
            ref={contentRef}
            className={
              animationPhase === "exit"
                ? transitionStyles.scheduleListExit
                : animationPhase === "enter"
                  ? transitionStyles.scheduleListEnter
                  : undefined
            }
          >
            {renderedDay === null ? null : (
              <div key={renderedDayKey} className={styles.sessionList}>
                {renderedSessions.length === 0 ? (
                  <div
                    className={`${styles.emptyDay} ${
                      animationPhase === "enter" ? transitionStyles.scheduleItemEnter : ""
                    }`}
                  >
                    {renderedDay.emptyLabel}
                  </div>
                ) : (
                  renderedSessions.map((session, index) => (
                    <div
                      key={session.id}
                      className={
                        animationPhase === "enter" ? transitionStyles.scheduleItemEnter : undefined
                      }
                      style={getItemStyle(index)}
                    >
                      <HomeWeeklyScheduleSessionRow
                        item={session.item}
                        locale={locale}
                        reserveLabel={t("weeklyScheduleReserve")}
                        withInstructorLabel={session.withInstructorLabel}
                        durationLabel={session.durationLabel}
                        spotsLeftLabel={session.spotsLeftLabel}
                        bookAriaLabel={session.bookAriaLabel}
                      />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
