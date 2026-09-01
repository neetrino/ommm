"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  SCHEDULE_ARROW_BTN,
  SCHEDULE_DATE_CHIP_IDLE,
  SCHEDULE_DATE_CHIP_PAST,
  SCHEDULE_DATE_CHIP_SELECTED,
  SCHEDULE_DATE_CHIP_TODAY,
  SCHEDULE_DATE_STRIP_ARROW_NEXT,
  SCHEDULE_DATE_STRIP_ARROW_PREV,
  SCHEDULE_INTERACTIVE_LIFT,
  SCHEDULE_WEEKDAY_LABEL,
} from "@/components/marketing/schedule/schedule-public-design";
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
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@/components/marketing/schedule/schedule-view-icons";
import styles from "@/components/marketing/schedule/schedule-date-month-panel.module.css";

const WEEKDAY_SAMPLE_SUNDAY = new Date(2024, 0, 7);

type ScheduleDateMonthPanelProps = {
  locale: string;
  selectedDate: Date;
  minDate: Date;
  maxDate: Date;
  onSelectDay: (date: Date) => void;
};

function isDaySelectable(day: Date, minDate: Date, maxDate: Date): boolean {
  return (
    !isBeforeCalendarDay(day, minDate) && !isAfterCalendarDay(day, maxDate)
  );
}

/**
 * Desktop in-panel month grid — expands the existing date strip to all weeks.
 */
export function ScheduleDateMonthPanel({
  locale,
  selectedDate,
  minDate,
  maxDate,
  onSelectDay,
}: ScheduleDateMonthPanelProps) {
  const t = useTranslations("marketingPages.schedule");
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfLocalMonth(selectedDate),
  );

  useEffect(() => {
    setVisibleMonth(startOfLocalMonth(selectedDate));
  }, [selectedDate]);

  const minMonth = useMemo(() => startOfLocalMonth(minDate), [minDate]);
  const maxMonth = useMemo(() => startOfLocalMonth(maxDate), [maxDate]);
  const canPrev = isBeforeCalendarDay(minMonth, visibleMonth);
  const canNext = isAfterCalendarDay(maxMonth, visibleMonth);
  const weeks = useMemo(() => buildMonthWeeks(visibleMonth), [visibleMonth]);
  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, idx) => {
        const day = new Date(WEEKDAY_SAMPLE_SUNDAY);
        day.setDate(WEEKDAY_SAMPLE_SUNDAY.getDate() + idx);
        return new Intl.DateTimeFormat(locale, { weekday: "short" })
          .format(day)
          .toUpperCase();
      }),
    [locale],
  );
  const monthTitle = `${formatScheduleMonthTitle(locale, visibleMonth)} ${visibleMonth.getFullYear()}`;

  return (
    <div className={styles.layout}>
      <button
        type="button"
        className={`${SCHEDULE_ARROW_BTN} ${SCHEDULE_DATE_STRIP_ARROW_PREV}`}
        aria-label={t("calendarPrevMonthAria")}
        disabled={!canPrev}
        aria-disabled={!canPrev}
        onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
      >
        <ArrowLeftIcon />
      </button>

      <div className={styles.body}>
        <p className={styles.monthTitle}>{monthTitle}</p>
        <div className={styles.weekdayRow}>
          {weekdayLabels.map((label, idx) => (
            <span key={`wd-${idx}`} className={SCHEDULE_WEEKDAY_LABEL}>
              {label}
            </span>
          ))}
        </div>
        <div className={styles.grid}>
          {weeks.map((week) => (
            <div key={week[0]?.getTime() ?? "week"} className={styles.weekRow}>
              {week.map((day) => {
                const inMonth = isSameCalendarMonth(day, visibleMonth);
                if (!inMonth) {
                  return <div key={day.getTime()} className={styles.daySlot} />;
                }

                const selectable = isDaySelectable(day, minDate, maxDate);
                const selected = isSameCalendarDay(day, selectedDate);
                const isToday = isSameCalendarDay(day, minDate);
                const chipClass = !selectable
                  ? SCHEDULE_DATE_CHIP_PAST
                  : isToday
                    ? SCHEDULE_DATE_CHIP_TODAY
                    : selected
                      ? SCHEDULE_DATE_CHIP_SELECTED
                      : SCHEDULE_DATE_CHIP_IDLE;

                if (!selectable) {
                  return (
                    <div
                      key={day.getTime()}
                      className={styles.daySlot}
                      aria-hidden
                    >
                      <span className={`${chipClass} opacity-45`}>
                        {day.getDate()}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={day.getTime()} className={styles.daySlot}>
                    <button
                      type="button"
                      className={`${styles.dayBtn} ${SCHEDULE_INTERACTIVE_LIFT}`}
                      aria-pressed={selected}
                      onClick={() => onSelectDay(startOfLocalDay(day))}
                    >
                      <span className={chipClass}>{day.getDate()}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={`${SCHEDULE_ARROW_BTN} ${SCHEDULE_DATE_STRIP_ARROW_NEXT}`}
        aria-label={t("calendarNextMonthAria")}
        disabled={!canNext}
        aria-disabled={!canNext}
        onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
      >
        <ArrowRightIcon />
      </button>
    </div>
  );
}
