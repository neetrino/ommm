"use client";

import styles from "@/components/marketing/schedule/schedule-week-board.module.css";
import type { ScheduleWeekColumn } from "@/components/marketing/schedule/schedule-week-board-helpers";

type ScheduleWeekDayHeaderProps = {
  column: ScheduleWeekColumn;
  locale: string;
  isToday: boolean;
  isSelected: boolean;
  isPastDay: boolean;
  isDimmed: boolean;
  isFocused: boolean;
  onFocusDay: (day: Date, dayKey: string) => void;
};

/** Week-board day chip. Dimmed days stay clickable unless the day is already past. */
export function ScheduleWeekDayHeader({
  column,
  locale,
  isToday,
  isSelected,
  isPastDay,
  isDimmed,
  isFocused,
  onFocusDay,
}: ScheduleWeekDayHeaderProps) {
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(
    column.day,
  );

  return (
    <button
      type="button"
      disabled={isPastDay}
      className={[styles.dayHeader, isDimmed ? styles.dayHeaderDimmed : ""]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onFocusDay(column.day, column.dayKey)}
      aria-pressed={isSelected || isFocused}
    >
      <span
        className={[
          styles.weekday,
          isToday || isSelected ? styles.weekdayActive : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {weekday}
      </span>
      <span
        className={[
          styles.dayNumber,
          isPastDay ? styles.dayNumberPast : "",
          isToday ? styles.dayNumberToday : "",
          !isToday && isSelected ? styles.dayNumberSelected : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {column.day.getDate()}
      </span>
    </button>
  );
}
