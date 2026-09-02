"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ScheduleDateMonthPanel } from "@/components/marketing/schedule/schedule-date-month-panel";
import styles from "@/components/marketing/schedule/schedule-week-board.module.css";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@/components/marketing/schedule/schedule-view-icons";
import { useSchedulePopoverMotion } from "@/components/marketing/schedule/use-schedule-popover-motion";
import { useDismissWhenOutside } from "@/hooks/use-dismiss-when-outside";

const WEEK_SHIFT_DAYS = 7;

type ScheduleWeekRangePickerProps = {
  locale: string;
  weekRangeLabel: string;
  selectedDate: Date;
  minDate: Date;
  maxDate: Date;
  canShiftPrev: boolean;
  canShiftNext: boolean;
  filtersSlot?: ReactNode;
  onSelectDay: (day: Date) => void;
  onShiftWindow: (delta: number) => void;
};

/** Week-range pill + filters for the desktop schedule board. */
export function ScheduleWeekRangePicker({
  locale,
  weekRangeLabel,
  selectedDate,
  minDate,
  maxDate,
  canShiftPrev,
  canShiftNext,
  filtersSlot,
  onSelectDay,
  onShiftWindow,
}: ScheduleWeekRangePickerProps) {
  const t = useTranslations("marketingPages.schedule");
  const calendarMotion = useSchedulePopoverMotion();
  const pickerRef = useRef<HTMLDivElement>(null);
  const dismissCalendarRef = useRef(() => {
    calendarMotion.hide();
  });
  dismissCalendarRef.current = () => {
    calendarMotion.hide();
  };

  useDismissWhenOutside(
    calendarMotion.open,
    pickerRef,
    dismissCalendarRef,
  );

  return (
    <>
      <div
        className={[
          styles.weekPickerRow,
          calendarMotion.mounted ? styles.weekPickerRowElevated : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div ref={pickerRef} className={styles.weekPicker}>
          <button
            type="button"
            className={styles.weekPickerBtn}
            aria-label={t("prevDatesAria")}
            disabled={!canShiftPrev}
            onClick={() => onShiftWindow(-WEEK_SHIFT_DAYS)}
          >
            <ArrowLeftIcon />
          </button>
          <button
            type="button"
            className={styles.weekPickerLabel}
            aria-label={t("weekRangeAria")}
            aria-expanded={calendarMotion.open}
            onClick={() => calendarMotion.toggle()}
          >
            {weekRangeLabel}
          </button>
          <button
            type="button"
            className={styles.weekPickerBtn}
            aria-label={t("nextDatesAria")}
            disabled={!canShiftNext}
            onClick={() => onShiftWindow(WEEK_SHIFT_DAYS)}
          >
            <ArrowRightIcon />
          </button>
          {calendarMotion.mounted ? (
            <ScheduleDateMonthPanel
              locale={locale}
              selectedDate={selectedDate}
              minDate={minDate}
              maxDate={maxDate}
              open={calendarMotion.open}
              placement="center"
              onSelectDay={(day) => {
                onSelectDay(day);
                calendarMotion.hide();
              }}
              onExitComplete={calendarMotion.onExitComplete}
            />
          ) : null}
        </div>
      </div>

      {filtersSlot ? <div className={styles.filtersSlot}>{filtersSlot}</div> : null}
    </>
  );
}
