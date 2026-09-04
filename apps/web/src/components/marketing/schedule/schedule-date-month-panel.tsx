"use client";

import { useEffect, useMemo, useRef, useState, type TransitionEvent } from "react";
import { useTranslations } from "next-intl";
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
import { useVisibleMonthFollow } from "@/components/marketing/schedule/use-visible-month-follow";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const WEEKDAY_SAMPLE_MONDAY = new Date(2024, 0, 1);
/** Keep in sync with `.popoverAnimated` transform duration. */
const POPOVER_EXIT_FALLBACK_MS = 560;

type ScheduleDateMonthPanelProps = {
  locale: string;
  selectedDate: Date;
  minDate: Date;
  maxDate: Date;
  /** When false, plays the dismiss animation then calls `onExitComplete`. */
  open?: boolean;
  /** `center` aligns under the week-range pill; default anchors to the trigger’s end. */
  placement?: "end" | "center";
  onSelectDay: (date: Date) => void;
  onExitComplete?: () => void;
};

function isDaySelectable(day: Date, minDate: Date, maxDate: Date): boolean {
  return (
    !isBeforeCalendarDay(day, minDate) && !isAfterCalendarDay(day, maxDate)
  );
}

/**
 * Desktop month popover — ANIMO-style header + compact day grid.
 * Open/close motion matches schedule filter dropdown dismiss animation.
 */
export function ScheduleDateMonthPanel({
  locale,
  selectedDate,
  minDate,
  maxDate,
  open = true,
  placement = "end",
  onSelectDay,
  onExitComplete,
}: ScheduleDateMonthPanelProps) {
  const t = useTranslations("marketingPages.schedule");
  const reducedMotion = usePrefersReducedMotion();
  const today = startOfLocalDay(new Date());
  const [visible, setVisible] = useState(false);
  const exitCompletedRef = useRef(false);
  const [visibleMonth, setVisibleMonth] = useVisibleMonthFollow(selectedDate);

  useEffect(() => {
    if (open) {
      exitCompletedRef.current = false;
    }

    if (!open) {
      const exitId = window.requestAnimationFrame(() => {
        setVisible(false);
      });
      return () => window.cancelAnimationFrame(exitId);
    }

    if (reducedMotion) {
      const enterId = window.requestAnimationFrame(() => {
        setVisible(true);
      });
      return () => window.cancelAnimationFrame(enterId);
    }

    let innerId = 0;
    const outerId = window.requestAnimationFrame(() => {
      innerId = window.requestAnimationFrame(() => {
        setVisible(true);
      });
    });
    return () => {
      window.cancelAnimationFrame(outerId);
      window.cancelAnimationFrame(innerId);
    };
  }, [open, reducedMotion]);

  useEffect(() => {
    if (open || onExitComplete === undefined || reducedMotion) {
      return undefined;
    }
    const timeoutId = window.setTimeout(() => {
      if (exitCompletedRef.current) {
        return;
      }
      exitCompletedRef.current = true;
      onExitComplete();
    }, POPOVER_EXIT_FALLBACK_MS);
    return () => window.clearTimeout(timeoutId);
  }, [open, onExitComplete, reducedMotion]);

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
        return new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(
          day,
        );
      }),
    [locale],
  );
  const monthTitle = `${formatScheduleMonthTitle(locale, visibleMonth)} ${visibleMonth.getFullYear()}`;
  const isCenter = placement === "center";

  function onTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (event.propertyName !== "opacity" && event.propertyName !== "transform") {
      return;
    }
    if (!open && !exitCompletedRef.current) {
      exitCompletedRef.current = true;
      onExitComplete?.();
    }
  }

  return (
    <div
      className={[
        styles.popover,
        isCenter ? styles.popoverCenter : "",
        styles.popoverAnimated,
        visible ? styles.popoverAnimatedVisible : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="dialog"
      aria-label={t("fullCalendar")}
      aria-hidden={!visible}
      onTransitionEnd={onTransitionEnd}
    >
      <div className={styles.header}>
        <p className={styles.monthTitle}>{monthTitle}</p>
        <div className={styles.navGroup}>
          <button
            type="button"
            className={styles.navBtn}
            aria-label={t("calendarPrevMonthAria")}
            disabled={!canPrev}
            aria-disabled={!canPrev}
            onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
          >
            <ArrowLeftIcon />
          </button>
          <button
            type="button"
            className={styles.navBtn}
            aria-label={t("calendarNextMonthAria")}
            disabled={!canNext}
            aria-disabled={!canNext}
            onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
          >
            <ArrowRightIcon />
          </button>
        </div>
      </div>

      <div className={styles.weekdayRow}>
        {weekdayLabels.map((label, idx) => (
          <span key={`wd-${idx}`} className={styles.weekdayLabel}>
            {label}
          </span>
        ))}
      </div>

      <div className={styles.grid}>
        {weeks.map((week) => (
          <div key={week[0]?.getTime() ?? "week"} className={styles.weekRow}>
            {week.map((day) => {
              const inMonth = isSameCalendarMonth(day, visibleMonth);
              const selectable = isDaySelectable(day, minDate, maxDate);
              const selected = isSameCalendarDay(day, selectedDate);
              const isToday = isSameCalendarDay(day, today);

              return (
                <div key={day.getTime()} className={styles.daySlot}>
                  <button
                    type="button"
                    disabled={!selectable}
                    aria-pressed={selected}
                    className={[
                      styles.dayBtn,
                      !inMonth ? styles.dayBtnOutside : "",
                      !selectable ? styles.dayBtnDisabled : "",
                      isToday ? styles.dayBtnToday : "",
                      selected ? styles.dayBtnSelected : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => onSelectDay(startOfLocalDay(day))}
                  >
                    {day.getDate()}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
