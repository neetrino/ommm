"use client";

import { createPortal } from "react-dom";
import { useId, useMemo } from "react";
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
import styles from "@/components/marketing/schedule/schedule-month-calendar-sheet.module.css";
import { useScheduleCalendarSheetMotion } from "@/components/marketing/schedule/use-schedule-calendar-sheet-motion";
import { useVisibleMonthFollow } from "@/components/marketing/schedule/use-visible-month-follow";
import { useCloseOnEscape } from "@/hooks/use-close-on-escape";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";

const WEEKDAY_SAMPLE_SUNDAY = new Date(2024, 0, 7);

type ScheduleMonthCalendarSheetProps = {
  open: boolean;
  locale: string;
  selectedDate: Date;
  minDate: Date;
  maxDate: Date;
  onClose: () => void;
  onSelectDay: (date: Date) => void;
};

function isDaySelectable(day: Date, minDate: Date, maxDate: Date): boolean {
  return (
    !isBeforeCalendarDay(day, minDate) && !isAfterCalendarDay(day, maxDate)
  );
}

/**
 * Mobile web month grid — jump to any bookable day in the public schedule range.
 */
export function ScheduleMonthCalendarSheet({
  open,
  locale,
  selectedDate,
  minDate,
  maxDate,
  onClose,
  onSelectDay,
}: ScheduleMonthCalendarSheetProps) {
  const t = useTranslations("marketingPages.schedule");
  const titleId = useId();
  const clientMounted = useIsClientMounted();
  const { presented, motionOpen, requestClose } = useScheduleCalendarSheetMotion(
    open,
    onClose,
  );
  const [visibleMonth, setVisibleMonth] = useVisibleMonthFollow(
    selectedDate,
    open,
  );

  useLockBodyScroll(presented);
  useCloseOnEscape(presented, requestClose);

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
          .toUpperCase()
          .slice(0, 2);
      }),
    [locale],
  );
  const monthTitle = `${formatScheduleMonthTitle(locale, visibleMonth)} ${visibleMonth.getFullYear()}`;

  if (!presented || !clientMounted) {
    return null;
  }

  const backdropClass = [
    styles.backdrop,
    motionOpen ? styles.backdropOpen : styles.backdropClosing,
  ].join(" ");
  const panelClass = [
    styles.sheetPanel,
    motionOpen ? styles.sheetPanelOpen : styles.sheetPanelClosing,
  ].join(" ");

  return createPortal(
    <div className={styles.overlay} role="presentation">
      <button
        type="button"
        className={backdropClass}
        aria-label={t("fullCalendarAria")}
        onClick={requestClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={panelClass}
      >
        <h2 id={titleId} className={styles.title}>
          {t("fullCalendar")}
        </h2>

        <div className={styles.monthNav}>
          <button
            type="button"
            className={styles.navBtn}
            disabled={!canPrev}
            aria-label={t("calendarPrevMonthAria")}
            onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
          >
            <ArrowLeftIcon />
          </button>
          <p className={styles.monthLabel}>{monthTitle}</p>
          <button
            type="button"
            className={styles.navBtn}
            disabled={!canNext}
            aria-label={t("calendarNextMonthAria")}
            onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
          >
            <ArrowRightIcon />
          </button>
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
                if (!inMonth) {
                  return <div key={day.getTime()} className={styles.daySlot} />;
                }

                const selectable = isDaySelectable(day, minDate, maxDate);
                const selected = isSameCalendarDay(day, selectedDate);
                const isToday = isSameCalendarDay(day, minDate);

                return (
                  <div key={day.getTime()} className={styles.daySlot}>
                    <button
                      type="button"
                      disabled={!selectable}
                      aria-pressed={selected}
                      className={[
                        styles.dayBtn,
                        isToday ? styles.dayBtnToday : "",
                        selected ? styles.dayBtnSelected : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => {
                        onSelectDay(startOfLocalDay(day));
                        requestClose();
                      }}
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
    </div>,
    document.body,
  );
}
