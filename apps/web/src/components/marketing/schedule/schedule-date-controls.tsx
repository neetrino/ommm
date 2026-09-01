"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  SCHEDULE_ARROW_BTN,
  SCHEDULE_DATE_CHIP_IDLE,
  SCHEDULE_DATE_CHIP_PAST,
  SCHEDULE_DATE_CHIP_SELECTED,
  SCHEDULE_DATE_CHIP_TODAY,
  SCHEDULE_DATE_STRIP_ARROW_NEXT,
  SCHEDULE_DATE_STRIP_ARROW_PREV,
  SCHEDULE_DATE_STRIP_ARROWS,
  SCHEDULE_DATE_STRIP_DAYS,
  SCHEDULE_DATE_STRIP_LAYOUT,
  SCHEDULE_DATE_STRIP_PANEL,
  SCHEDULE_FULL_CALENDAR_BTN,
  SCHEDULE_FULL_CALENDAR_BTN_LABEL,
  SCHEDULE_INTERACTIVE_LIFT,
  SCHEDULE_SELECTED_DAY_DIVIDER,
  SCHEDULE_SELECTED_DAY_LABEL,
  SCHEDULE_WEEKDAY_LABEL,
  SCHEDULE_WEEKDAY_LABEL_ACTIVE,
} from "@/components/marketing/schedule/schedule-public-design";
import {
  addDays,
  compareCalendarDays,
  isAfterCalendarDay,
  isBeforeCalendarDay,
  isSameCalendarDay,
  startOfLocalDay,
} from "@/components/marketing/schedule/schedule-date-utils";
import { formatDateForUi } from "@/lib/date-display";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
} from "@/components/marketing/schedule/schedule-view-icons";
import { ScheduleMonthCalendarSheet } from "@/components/marketing/schedule/schedule-month-calendar-sheet";

export const SCHEDULE_DATE_STRIP_VISIBLE_DAYS = 7;
export const SCHEDULE_DATE_STRIP_WINDOW_SHIFT = 7;

const VISIBLE_DAYS = SCHEDULE_DATE_STRIP_VISIBLE_DAYS;
const WINDOW_SHIFT = SCHEDULE_DATE_STRIP_WINDOW_SHIFT;

function formatWeekdayShort(locale: string, date: Date): string {
  return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
}

function formatSelectedLong(locale: string, date: Date): string {
  return `${formatWeekdayShort(locale, date)}, ${formatDateForUi(date)}`;
}

type ScheduleDateControlsProps = {
  locale: string;
  selectedDate: Date;
  windowStart: Date;
  maxDate?: Date;
  onSelectDay: (d: Date) => void;
  onShiftWindow: (delta: number) => void;
};

export function ScheduleDateControls({
  locale,
  selectedDate,
  windowStart,
  maxDate,
  onSelectDay,
  onShiftWindow,
}: ScheduleDateControlsProps) {
  const t = useTranslations("marketingPages.schedule");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const stripDays = Array.from({ length: VISIBLE_DAYS }, (_, idx) => addDays(windowStart, idx));
  const today = startOfLocalDay(new Date());
  const canShiftPrev = compareCalendarDays(addDays(windowStart, -1), today) >= 0;
  const canShiftNext =
    maxDate === undefined ||
    !isAfterCalendarDay(addDays(windowStart, WINDOW_SHIFT), maxDate);
  const selectedLong = formatSelectedLong(locale, selectedDate);
  const calendarMaxDate = maxDate ?? addDays(today, 30);

  return (
    <>
      <div className={SCHEDULE_DATE_STRIP_PANEL}>
        <div className={SCHEDULE_DATE_STRIP_LAYOUT}>
          <div className={SCHEDULE_DATE_STRIP_DAYS}>
            {stripDays.map((day) => {
              const isSelected = isSameCalendarDay(day, selectedDate);
              const isToday = isSameCalendarDay(day, today);
              const isPast =
                isBeforeCalendarDay(day, today) ||
                (maxDate !== undefined && isAfterCalendarDay(day, maxDate));
              const dayNum = String(day.getDate());
              const wk = formatWeekdayShort(locale, day).toUpperCase();
              const weekdayClass = `${SCHEDULE_WEEKDAY_LABEL} ${isSelected ? SCHEDULE_WEEKDAY_LABEL_ACTIVE : ""}`;
              const chipClass = isPast
                ? SCHEDULE_DATE_CHIP_PAST
                : isToday
                  ? SCHEDULE_DATE_CHIP_TODAY
                  : isSelected
                    ? SCHEDULE_DATE_CHIP_SELECTED
                    : SCHEDULE_DATE_CHIP_IDLE;

              if (isPast) {
                return (
                  <div
                    key={day.getTime()}
                    aria-hidden
                    className="flex min-w-0 flex-col items-center justify-center gap-2 rounded-2xl py-1 opacity-45"
                  >
                    <span className={weekdayClass}>{wk}</span>
                    <span className={chipClass}>{dayNum}</span>
                  </div>
                );
              }

              return (
                <button
                  key={day.getTime()}
                  type="button"
                  onClick={() => onSelectDay(startOfLocalDay(day))}
                  className={`flex min-w-0 flex-col items-center justify-center gap-2 rounded-2xl py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#97907c]/30 ${SCHEDULE_INTERACTIVE_LIFT}`}
                >
                  <span className={weekdayClass}>{wk}</span>
                  <span className={chipClass}>{dayNum}</span>
                </button>
              );
            })}
          </div>
          <div className={SCHEDULE_DATE_STRIP_ARROWS}>
            <button
              type="button"
              className={`${SCHEDULE_ARROW_BTN} ${SCHEDULE_DATE_STRIP_ARROW_PREV}`}
              aria-label={t("prevDatesAria")}
              disabled={!canShiftPrev}
              aria-disabled={!canShiftPrev}
              onClick={() => onShiftWindow(-WINDOW_SHIFT)}
            >
              <ArrowLeftIcon />
            </button>
            <button
              type="button"
              className={`${SCHEDULE_ARROW_BTN} ${SCHEDULE_DATE_STRIP_ARROW_NEXT}`}
              aria-label={t("nextDatesAria")}
              disabled={!canShiftNext}
              aria-disabled={!canShiftNext}
              onClick={() => onShiftWindow(WINDOW_SHIFT)}
            >
              <ArrowRightIcon />
            </button>
          </div>
        </div>
      </div>

      <div className={SCHEDULE_SELECTED_DAY_DIVIDER}>
        <p className={SCHEDULE_SELECTED_DAY_LABEL}>{selectedLong}</p>
        <button
          type="button"
          className={SCHEDULE_FULL_CALENDAR_BTN}
          aria-label={t("fullCalendarAria")}
          onClick={() => setCalendarOpen(true)}
        >
          <CalendarIcon />
          <span className={SCHEDULE_FULL_CALENDAR_BTN_LABEL}>{t("fullCalendar")}</span>
        </button>
      </div>

      <ScheduleMonthCalendarSheet
        open={calendarOpen}
        locale={locale}
        selectedDate={selectedDate}
        minDate={today}
        maxDate={calendarMaxDate}
        onClose={() => setCalendarOpen(false)}
        onSelectDay={onSelectDay}
      />
    </>
  );
}
