"use client";

import { useMemo } from "react";
import {
  addMonths,
  buildMonthWeeks,
  formatScheduleMonthTitle,
  formatWeekdayShortLabels,
  isAfterCalendarDay,
  isBeforeCalendarDay,
  isSameCalendarDay,
  isSameCalendarMonth,
  startOfLocalDay,
  startOfLocalMonth,
} from "@/components/marketing/schedule/schedule-date-utils";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@/components/marketing/schedule/schedule-view-icons";
import styles from "@/components/shared/schedule/schedule-month-calendar.module.css";
import { toLocalIsoDate } from "@/lib/local-iso-date";

export type ScheduleMonthCalendarLabels = {
  boardAria: string;
  prevMonthAria: string;
  nextMonthAria: string;
  todayBadge: string;
  classCount: (count: number) => string;
  dayAria: (day: number) => string;
  dayAriaWithCount: (day: number, count: number) => string;
};

export type ScheduleMonthCalendarProps = {
  locale: string;
  selectedDate: Date;
  daySheetOpen: boolean;
  minDate?: Date;
  maxDate?: Date;
  sessionCountByDayKey: ReadonlyMap<string, number>;
  visibleMonth: Date;
  onVisibleMonthChange: (month: Date) => void;
  onSelectDay: (day: Date) => void;
  labels: ScheduleMonthCalendarLabels;
};

function isDaySelectable(day: Date, minDate?: Date, maxDate?: Date): boolean {
  if (minDate !== undefined && isBeforeCalendarDay(day, minDate)) return false;
  if (maxDate !== undefined && isAfterCalendarDay(day, maxDate)) return false;
  return true;
}

function dayNumberClassName(
  isPast: boolean,
  isToday: boolean,
  isSelected: boolean,
  hasClasses: boolean,
): string {
  return [
    styles.dayNumber,
    isPast ? styles.dayNumberPast : "",
    isToday ? styles.dayNumberToday : "",
    isSelected ? styles.dayNumberSelected : "",
    hasClasses && !isSelected && !isToday ? styles.dayNumberHasClasses : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function dayCellClassName(
  selectable: boolean,
  hasClasses: boolean,
  isToday: boolean,
  isSelected: boolean,
): string {
  return [
    styles.dayCell,
    selectable ? styles.dayCellInteractive : styles.dayCellMuted,
    hasClasses ? styles.dayCellHasClasses : "",
    isToday ? styles.dayCellToday : "",
    isSelected ? styles.dayCellSelected : "",
  ]
    .filter(Boolean)
    .join(" ");
}

type MonthDayCellProps = {
  day: Date;
  selectable: boolean;
  isSelected: boolean;
  isToday: boolean;
  isPast: boolean;
  classCount: number;
  labels: ScheduleMonthCalendarLabels;
  onSelect: (day: Date) => void;
};

function MonthDayCell({
  day,
  selectable,
  isSelected,
  isToday,
  isPast,
  classCount,
  labels,
  onSelect,
}: MonthDayCellProps) {
  const hasClasses = classCount > 0;
  const countLabel = hasClasses ? labels.classCount(classCount) : null;
  const numberClass = dayNumberClassName(isPast, isToday, isSelected, hasClasses);
  const cellClass = dayCellClassName(selectable, hasClasses, isToday, isSelected);
  const inner = (
    <>
      <div className={styles.dayCellTop}>
        <span className={numberClass}>{day.getDate()}</span>
        {isToday ? <span className={styles.todayBadge}>{labels.todayBadge}</span> : null}
      </div>
      {countLabel !== null ? <p className={styles.dayCount}>{countLabel}</p> : null}
    </>
  );

  if (!selectable) {
    return (
      <div className={styles.daySlot}>
        <div className={cellClass} aria-hidden>
          {inner}
        </div>
      </div>
    );
  }

  const ariaLabel = hasClasses
    ? labels.dayAriaWithCount(day.getDate(), classCount)
    : labels.dayAria(day.getDate());

  return (
    <div className={styles.daySlot}>
      <button
        type="button"
        className={cellClass}
        aria-label={ariaLabel}
        aria-pressed={isSelected}
        onClick={() => onSelect(startOfLocalDay(day))}
      >
        {inner}
      </button>
    </div>
  );
}

/** Month grid — day cards with class counts; selecting a day opens the sheet. */
export function ScheduleMonthCalendar({
  locale,
  selectedDate,
  daySheetOpen,
  minDate,
  maxDate,
  sessionCountByDayKey,
  visibleMonth,
  onVisibleMonthChange,
  onSelectDay,
  labels,
}: ScheduleMonthCalendarProps) {
  const today = startOfLocalDay(new Date());
  const minMonth = useMemo(
    () => (minDate !== undefined ? startOfLocalMonth(minDate) : null),
    [minDate],
  );
  const maxMonth = useMemo(
    () => (maxDate !== undefined ? startOfLocalMonth(maxDate) : null),
    [maxDate],
  );
  const canPrev = minMonth === null || isBeforeCalendarDay(minMonth, visibleMonth);
  const canNext = maxMonth === null || isAfterCalendarDay(maxMonth, visibleMonth);
  const weeks = useMemo(() => buildMonthWeeks(visibleMonth), [visibleMonth]);
  const weekdayLabels = useMemo(() => formatWeekdayShortLabels(locale), [locale]);
  const monthTitle = `${formatScheduleMonthTitle(locale, visibleMonth)} ${visibleMonth.getFullYear()}`;

  return (
    <div className={styles.calendarPanel} aria-label={labels.boardAria}>
      <div className={styles.monthNav}>
        <button
          type="button"
          className={styles.navBtn}
          aria-label={labels.prevMonthAria}
          disabled={!canPrev}
          onClick={() => onVisibleMonthChange(addMonths(visibleMonth, -1))}
        >
          <ArrowLeftIcon />
        </button>
        <h2 className={styles.monthTitle}>{monthTitle}</h2>
        <button
          type="button"
          className={styles.navBtn}
          aria-label={labels.nextMonthAria}
          disabled={!canNext}
          onClick={() => onVisibleMonthChange(addMonths(visibleMonth, 1))}
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
          <div key={week[0]?.getTime() ?? "week"} className={styles.weekRow}>
            {week.map((day) => {
              if (!isSameCalendarMonth(day, visibleMonth)) {
                return <div key={day.getTime()} className={styles.daySlot} />;
              }

              return (
                <MonthDayCell
                  key={day.getTime()}
                  day={day}
                  selectable={isDaySelectable(day, minDate, maxDate)}
                  isSelected={daySheetOpen && isSameCalendarDay(day, selectedDate)}
                  isToday={isSameCalendarDay(day, today)}
                  isPast={isBeforeCalendarDay(day, today)}
                  classCount={sessionCountByDayKey.get(toLocalIsoDate(day)) ?? 0}
                  labels={labels}
                  onSelect={onSelectDay}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
