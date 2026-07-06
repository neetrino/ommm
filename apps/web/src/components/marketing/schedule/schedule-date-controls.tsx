"use client";

import { useTranslations } from "next-intl";
import {
  SCHEDULE_ARROW_BTN,
  SCHEDULE_DATE_CHIP_ACTIVE,
  SCHEDULE_DATE_CHIP_IDLE,
  SCHEDULE_DATE_CHIP_PAST,
  SCHEDULE_DATE_STRIP_PANEL,
  SCHEDULE_INK,
  SCHEDULE_INTERACTIVE_LIFT,
  SCHEDULE_MUTED,
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
} from "@/components/marketing/schedule/schedule-view-icons";

export const SCHEDULE_DATE_STRIP_VISIBLE_DAYS = 7;
export const SCHEDULE_DATE_STRIP_WINDOW_SHIFT = 7;

const VISIBLE_DAYS = SCHEDULE_DATE_STRIP_VISIBLE_DAYS;
const WINDOW_SHIFT = SCHEDULE_DATE_STRIP_WINDOW_SHIFT;

function formatWeekdayShort(locale: string, date: Date): string {
  return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
}

function formatMonthTitle(locale: string, date: Date): string {
  return new Intl.DateTimeFormat(locale, { month: "long" }).format(date);
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
  const stripDays = Array.from({ length: VISIBLE_DAYS }, (_, idx) => addDays(windowStart, idx));
  const today = startOfLocalDay(new Date());
  const canShiftPrev = compareCalendarDays(addDays(windowStart, -1), today) >= 0;
  const canShiftNext =
    maxDate === undefined ||
    !isAfterCalendarDay(addDays(windowStart, WINDOW_SHIFT), maxDate);
  const monthLabel = formatMonthTitle(locale, selectedDate);
  const selectedLong = formatSelectedLong(locale, selectedDate);

  return (
    <>
      <div className="mt-10">
        <p className={`text-lg font-semibold capitalize ${SCHEDULE_INK}`}>{monthLabel}</p>
      </div>

      <div className={`mt-4 ${SCHEDULE_DATE_STRIP_PANEL}`}>
        <div className="flex w-full min-w-0 items-stretch gap-2 sm:gap-3">
          <button
            type="button"
            className={`${SCHEDULE_ARROW_BTN} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/85`}
            aria-label={t("prevDatesAria")}
            disabled={!canShiftPrev}
            aria-disabled={!canShiftPrev}
            onClick={() => onShiftWindow(-WINDOW_SHIFT)}
          >
            <ArrowLeftIcon />
          </button>
          <div className="grid min-w-0 flex-1 grid-cols-7 gap-1 sm:gap-2">
            {stripDays.map((day) => {
              const active = isSameCalendarDay(day, selectedDate);
              const isToday = isSameCalendarDay(day, today);
              const isPast =
                isBeforeCalendarDay(day, today) ||
                (maxDate !== undefined && isAfterCalendarDay(day, maxDate));
              const dayNum = String(day.getDate());
              const wk = formatWeekdayShort(locale, day).toUpperCase();
              const weekdayClass = `w-full truncate text-center text-[9px] font-medium uppercase tracking-wide sm:text-[10px] ${SCHEDULE_MUTED}`;
              const chipClass = isPast
                ? SCHEDULE_DATE_CHIP_PAST
                : active
                  ? SCHEDULE_DATE_CHIP_ACTIVE
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
                  className={`flex min-w-0 flex-col items-center justify-center gap-2 rounded-2xl py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-700/25 ${SCHEDULE_INTERACTIVE_LIFT}`}
                >
                  <span
                    className={`w-full truncate text-center text-[9px] font-medium uppercase tracking-wide transition-colors duration-300 ease-out sm:text-[10px] ${active ? "text-sage-700" : SCHEDULE_MUTED}`}
                  >
                    {wk}
                  </span>
                  <span
                    className={`${chipClass} ${isToday ? "border border-black/70" : ""}`}
                  >
                    {dayNum}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className={`${SCHEDULE_ARROW_BTN} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/85`}
            aria-label={t("nextDatesAria")}
            disabled={!canShiftNext}
            aria-disabled={!canShiftNext}
            onClick={() => onShiftWindow(WINDOW_SHIFT)}
          >
            <ArrowRightIcon />
          </button>
        </div>
      </div>

      <div className="mt-8 border-b border-white/55 pb-3">
        <p className={`text-lg font-semibold capitalize ${SCHEDULE_INK}`}>{selectedLong}</p>
      </div>
    </>
  );
}
