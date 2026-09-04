"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  SCHEDULE_ARROW_BTN,
  SCHEDULE_DATE_STRIP_PANEL,
  SCHEDULE_DATE_STRIP_PAGER_ROW,
  SCHEDULE_FULL_CALENDAR_BTN,
  SCHEDULE_FULL_CALENDAR_BTN_ACTIVE,
  SCHEDULE_FULL_CALENDAR_BTN_LABEL,
  SCHEDULE_SELECTED_DAY_DIVIDER,
  SCHEDULE_SELECTED_DAY_LABEL,
} from "@/components/marketing/schedule/schedule-public-design";
import {
  addDays,
  compareCalendarDays,
  isAfterCalendarDay,
  isBeforeCalendarDay,
  startOfLocalDay,
  startOfWeekSunday,
} from "@/components/marketing/schedule/schedule-date-utils";
import { formatDateForUi } from "@/lib/date-display";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
} from "@/components/marketing/schedule/schedule-view-icons";
import { ScheduleDateMonthPanel } from "@/components/marketing/schedule/schedule-date-month-panel";
import { ScheduleDateWeekPager } from "@/components/marketing/schedule/schedule-date-week-pager";
import { ScheduleMonthCalendarSheet } from "@/components/marketing/schedule/schedule-month-calendar-sheet";
import { useScheduleDesktopLayout } from "@/components/marketing/schedule/use-schedule-desktop-layout";
import { useSchedulePopoverMotion } from "@/components/marketing/schedule/use-schedule-popover-motion";
import { useDismissWhenOutside } from "@/hooks/use-dismiss-when-outside";

export const SCHEDULE_DATE_STRIP_VISIBLE_DAYS = 7;
export const SCHEDULE_DATE_STRIP_WINDOW_SHIFT = 7;

const WINDOW_SHIFT = SCHEDULE_DATE_STRIP_WINDOW_SHIFT;

function formatWeekdayShort(locale: string, date: Date): string {
  return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
}

function formatSelectedLong(locale: string, date: Date): string {
  return `${formatWeekdayShort(locale, date)}, ${formatDateForUi(date)}`;
}

function clampScheduleDay(
  day: Date,
  earliestDate: Date,
  maxDate: Date | undefined,
): Date {
  if (isBeforeCalendarDay(day, earliestDate)) {
    return earliestDate;
  }
  if (maxDate !== undefined && isAfterCalendarDay(day, maxDate)) {
    return startOfLocalDay(maxDate);
  }
  return startOfLocalDay(day);
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
  const today = startOfLocalDay(new Date());
  const earliestDate = minDate !== undefined ? startOfLocalDay(minDate) : today;
  const calendarMaxDate = maxDate ?? addDays(today, 30);
  const selectedWeekStart = startOfWeekSunday(selectedDate);
  const canShiftPrevWeek =
    compareCalendarDays(addDays(selectedWeekStart, -1), earliestDate) >= 0;
  const canShiftNextWeek =
    maxDate === undefined ||
    !isAfterCalendarDay(addDays(selectedWeekStart, WINDOW_SHIFT), maxDate);
  const canShiftPrev =
    compareCalendarDays(addDays(windowStart, -1), earliestDate) >= 0;
  const canShiftNext =
    maxDate === undefined ||
    !isAfterCalendarDay(addDays(windowStart, WINDOW_SHIFT), maxDate);
  const selectedLong = formatSelectedLong(locale, selectedDate);

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

  function shiftSelectedWeek(direction: -1 | 1) {
    const candidate = addDays(selectedDate, direction * WINDOW_SHIFT);
    onSelectDay(clampScheduleDay(candidate, earliestDate, maxDate));
  }

  return (
    <>
      {showDateStrip ? (
        <div className={SCHEDULE_DATE_STRIP_PANEL}>
          <div className={SCHEDULE_DATE_STRIP_PAGER_ROW}>
            <button
              type="button"
              className={SCHEDULE_ARROW_BTN}
              aria-label={t("prevDatesAria")}
              disabled={!canShiftPrevWeek}
              aria-disabled={!canShiftPrevWeek}
              onClick={() => shiftSelectedWeek(-1)}
            >
              <ArrowLeftIcon />
            </button>
            <ScheduleDateWeekPager
              locale={locale}
              selectedDate={selectedDate}
              earliestDate={earliestDate}
              maxDate={maxDate}
              today={today}
              onSelectDay={onSelectDay}
            />
            <button
              type="button"
              className={SCHEDULE_ARROW_BTN}
              aria-label={t("nextDatesAria")}
              disabled={!canShiftNextWeek}
              aria-disabled={!canShiftNextWeek}
              onClick={() => shiftSelectedWeek(1)}
            >
              <ArrowRightIcon />
            </button>
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
