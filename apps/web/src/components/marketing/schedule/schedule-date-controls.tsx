"use client";

import { useRef, useState } from "react";
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
  SCHEDULE_FULL_CALENDAR_BTN_ACTIVE,
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
import { ScheduleDateMonthPanel } from "@/components/marketing/schedule/schedule-date-month-panel";
import { ScheduleMonthCalendarSheet } from "@/components/marketing/schedule/schedule-month-calendar-sheet";
import { useScheduleDesktopLayout } from "@/components/marketing/schedule/use-schedule-desktop-layout";
import { useSchedulePopoverMotion } from "@/components/marketing/schedule/use-schedule-popover-motion";
import { useDismissWhenOutside } from "@/hooks/use-dismiss-when-outside";

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
  /** Earliest selectable day (defaults to today). */
  minDate?: Date;
  maxDate?: Date;
  /** When false, only the selected-day row + full calendar control render. */
  showDateStrip?: boolean;
  onSelectDay: (d: Date) => void;
  onShiftWindow: (delta: number) => void;
};

export function ScheduleDateControls({
  locale,
  selectedDate,
  windowStart,
  minDate,
  maxDate,
  showDateStrip = true,
  onSelectDay,
  onShiftWindow,
}: ScheduleDateControlsProps) {
  const t = useTranslations("marketingPages.schedule");
  const isDesktop = useScheduleDesktopLayout();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const monthPopover = useSchedulePopoverMotion();
  const calendarAnchorRef = useRef<HTMLDivElement>(null);
  const stripDays = Array.from({ length: VISIBLE_DAYS }, (_, idx) =>
    addDays(windowStart, idx),
  );
  const today = startOfLocalDay(new Date());
  const earliestDate = minDate !== undefined ? startOfLocalDay(minDate) : today;
  const canShiftPrev =
    compareCalendarDays(addDays(windowStart, -1), earliestDate) >= 0;
  const canShiftNext =
    maxDate === undefined ||
    !isAfterCalendarDay(addDays(windowStart, WINDOW_SHIFT), maxDate);
  const selectedLong = formatSelectedLong(locale, selectedDate);
  const calendarMaxDate = maxDate ?? addDays(today, 30);

  useDismissWhenOutside(
    isDesktop && monthPopover.open,
    calendarAnchorRef,
    monthPopover.hide,
  );

  function onFullCalendarClick() {
    if (isDesktop) {
      monthPopover.toggle();
      return;
    }
    setCalendarOpen(true);
  }

  function onDesktopSelectDay(day: Date) {
    onSelectDay(day);
    monthPopover.hide();
  }

  return (
    <>
      {showDateStrip ? (
        <div className={SCHEDULE_DATE_STRIP_PANEL}>
          <div className={SCHEDULE_DATE_STRIP_LAYOUT}>
            <div className={SCHEDULE_DATE_STRIP_DAYS}>
              {stripDays.map((day) => {
                const isSelected = isSameCalendarDay(day, selectedDate);
                const isToday = isSameCalendarDay(day, today);
                const isBeforeMin = isBeforeCalendarDay(day, earliestDate);
                const isAfterMax =
                  maxDate !== undefined && isAfterCalendarDay(day, maxDate);
                const isUnavailable = isBeforeMin || isAfterMax;
                const isPast = isBeforeCalendarDay(day, today);
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

                if (isUnavailable) {
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
                    className={`flex min-w-0 flex-col items-center justify-center gap-2 rounded-2xl py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#97907c]/30 ${SCHEDULE_INTERACTIVE_LIFT} ${isPast ? "opacity-55" : ""}`}
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
      ) : null}

      <div className={SCHEDULE_SELECTED_DAY_DIVIDER}>
        <p className={SCHEDULE_SELECTED_DAY_LABEL}>{selectedLong}</p>
        <div className="flex shrink-0 items-center gap-2">
          {!showDateStrip ? (
            <>
              <button
                type="button"
                className={SCHEDULE_ARROW_BTN}
                aria-label={t("prevDatesAria")}
                disabled={!canShiftPrev}
                aria-disabled={!canShiftPrev}
                onClick={() => onShiftWindow(-WINDOW_SHIFT)}
              >
                <ArrowLeftIcon />
              </button>
              <button
                type="button"
                className={SCHEDULE_ARROW_BTN}
                aria-label={t("nextDatesAria")}
                disabled={!canShiftNext}
                aria-disabled={!canShiftNext}
                onClick={() => onShiftWindow(WINDOW_SHIFT)}
              >
                <ArrowRightIcon />
              </button>
            </>
          ) : null}
          <div ref={calendarAnchorRef} className="relative shrink-0">
            <button
              type="button"
              className={[
                SCHEDULE_FULL_CALENDAR_BTN,
                monthPopover.open ? SCHEDULE_FULL_CALENDAR_BTN_ACTIVE : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={t("fullCalendarAria")}
              aria-expanded={isDesktop ? monthPopover.open : undefined}
              aria-haspopup={isDesktop ? "dialog" : undefined}
              onClick={onFullCalendarClick}
            >
              <CalendarIcon />
              <span className={SCHEDULE_FULL_CALENDAR_BTN_LABEL}>
                {t("fullCalendar")}
              </span>
            </button>
            {isDesktop && monthPopover.mounted ? (
              <ScheduleDateMonthPanel
                locale={locale}
                selectedDate={selectedDate}
                minDate={earliestDate}
                maxDate={calendarMaxDate}
                open={monthPopover.open}
                onSelectDay={onDesktopSelectDay}
                onExitComplete={monthPopover.onExitComplete}
              />
            ) : null}
          </div>
        </div>
      </div>

      <ScheduleMonthCalendarSheet
        open={!isDesktop && calendarOpen}
        locale={locale}
        selectedDate={selectedDate}
        minDate={earliestDate}
        maxDate={calendarMaxDate}
        onClose={() => setCalendarOpen(false)}
        onSelectDay={onSelectDay}
      />
    </>
  );
}
