"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import pageStyles from "@/components/marketing/schedule/marketing-schedule-page-section.module.css";
import {
  addMonths,
  buildMonthWeeks,
  formatScheduleMonthTitle,
  isAfterCalendarDay,
  isBeforeCalendarDay,
  isSameCalendarDay,
  isSameCalendarMonth,
  startOfLocalDay,
  startOfLocalMonth,
} from "@/components/marketing/schedule/schedule-date-utils";
import styles from "@/components/marketing/schedule/schedule-month-board.module.css";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@/components/marketing/schedule/schedule-view-icons";
import { useVisibleMonthFollow } from "@/components/marketing/schedule/use-visible-month-follow";
import { toLocalIsoDate } from "@/lib/local-iso-date";

const WEEKDAY_SAMPLE_MONDAY = new Date(2024, 0, 1);

type ScheduleMonthBoardProps = {
  locale: string;
  pageTitle: string;
  selectedDate: Date;
  minDate: Date;
  maxDate: Date;
  daySheetOpen: boolean;
  sessionCountByDayKey: ReadonlyMap<string, number>;
  layoutSwitcherSlot?: ReactNode;
  filtersSlot?: ReactNode;
  onSelectDay: (day: Date) => void;
};

function isDaySelectable(day: Date, minDate: Date, maxDate: Date): boolean {
  return (
    !isBeforeCalendarDay(day, minDate) && !isAfterCalendarDay(day, maxDate)
  );
}

/** Desktop month layout — day cards with class counts; selection opens the sheet. */
export function ScheduleMonthBoard({
  locale,
  pageTitle,
  selectedDate,
  minDate,
  maxDate,
  daySheetOpen,
  sessionCountByDayKey,
  layoutSwitcherSlot,
  filtersSlot,
  onSelectDay,
}: ScheduleMonthBoardProps) {
  const t = useTranslations("marketingPages.schedule");
  const today = startOfLocalDay(new Date());
  const [visibleMonth, setVisibleMonth] = useVisibleMonthFollow(selectedDate);
  const minMonth = useMemo(() => startOfLocalMonth(minDate), [minDate]);
  const maxMonth = useMemo(() => startOfLocalMonth(maxDate), [maxDate]);
  const canPrev = isBeforeCalendarDay(minMonth, visibleMonth);
  const canNext = isAfterCalendarDay(maxMonth, visibleMonth);
  const weeks = useMemo(() => buildMonthWeeks(visibleMonth), [visibleMonth]);
  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, idx) => {
        const day = new Date(WEEKDAY_SAMPLE_MONDAY);
        day.setDate(WEEKDAY_SAMPLE_MONDAY.getDate() + idx);
        return new Intl.DateTimeFormat(locale, { weekday: "short" })
          .format(day)
          .toUpperCase()
          .slice(0, 2);
      }),
    [locale],
  );
  const monthTitle = `${formatScheduleMonthTitle(locale, visibleMonth)} ${visibleMonth.getFullYear()}`;

  return (
    <div className={styles.board} aria-label={t("monthBoardAria")}>
      <div className={styles.chrome}>
        <header className={pageStyles.hero}>
          <h1 className={pageStyles.title}>{pageTitle}</h1>
        </header>
        {layoutSwitcherSlot !== undefined ? (
          <div className={styles.layoutSwitcherRow}>{layoutSwitcherSlot}</div>
        ) : null}
        {filtersSlot}
      </div>

      <div className={styles.calendarPanel}>
        <div className={styles.monthNav}>
          <button
            type="button"
            className={styles.navBtn}
            aria-label={t("calendarPrevMonthAria")}
            disabled={!canPrev}
            onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}
          >
            <ArrowLeftIcon />
          </button>
          <h2 className={styles.monthTitle}>{monthTitle}</h2>
          <button
            type="button"
            className={styles.navBtn}
            aria-label={t("calendarNextMonthAria")}
            disabled={!canNext}
            onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}
          >
            <ArrowRightIcon />
          </button>
        </div>

        <div className={styles.weekdayRow} aria-hidden>
          {weekdayLabels.map((label, idx) => (
            <span key={`${label}-${idx}`} className={styles.weekdayLabel}>
              {label}
            </span>
          ))}
        </div>

        <div className={styles.grid}>
          {weeks.map((week) => (
            <div
              key={week[0]?.getTime() ?? "week"}
              className={styles.weekRow}
            >
              {week.map((day) => {
                const inMonth = isSameCalendarMonth(day, visibleMonth);
                if (!inMonth) {
                  return <div key={day.getTime()} className={styles.daySlot} />;
                }

                const selectable = isDaySelectable(day, minDate, maxDate);
                const isSelected =
                  daySheetOpen && isSameCalendarDay(day, selectedDate);
                const isToday = isSameCalendarDay(day, today);
                const isPast = isBeforeCalendarDay(day, today);
                const classCount =
                  sessionCountByDayKey.get(toLocalIsoDate(day)) ?? 0;
                const hasClasses = classCount > 0;
                const dayNumberClass = [
                  styles.dayNumber,
                  isPast ? styles.dayNumberPast : "",
                  isToday ? styles.dayNumberToday : "",
                  isSelected ? styles.dayNumberSelected : "",
                  hasClasses && !isSelected && !isToday
                    ? styles.dayNumberHasClasses
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                const cellClass = [
                  styles.dayCell,
                  selectable ? styles.dayCellInteractive : styles.dayCellMuted,
                  hasClasses ? styles.dayCellHasClasses : "",
                  isToday ? styles.dayCellToday : "",
                  isSelected ? styles.dayCellSelected : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                const countLabel =
                  hasClasses
                    ? t("monthDayClassCount", { count: classCount })
                    : null;
                const ariaLabel = hasClasses
                  ? t("monthDayAriaWithCount", {
                      day: day.getDate(),
                      count: classCount,
                    })
                  : t("monthDayAria", { day: day.getDate() });

                const dayCellInner = (
                  <>
                    <div className={styles.dayCellTop}>
                      <span className={dayNumberClass}>{day.getDate()}</span>
                      {isToday ? (
                        <span className={styles.todayBadge}>{t("todayBadge")}</span>
                      ) : null}
                    </div>
                    {countLabel !== null ? (
                      <p className={styles.dayCount}>{countLabel}</p>
                    ) : null}
                  </>
                );

                if (!selectable) {
                  return (
                    <div key={day.getTime()} className={styles.daySlot}>
                      <div className={cellClass} aria-hidden>
                        {dayCellInner}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={day.getTime()} className={styles.daySlot}>
                    <button
                      type="button"
                      className={cellClass}
                      aria-label={ariaLabel}
                      aria-pressed={isSelected}
                      onClick={() => onSelectDay(startOfLocalDay(day))}
                    >
                      {dayCellInner}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
