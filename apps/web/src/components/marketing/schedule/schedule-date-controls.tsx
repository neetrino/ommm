"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  SCHEDULE_ARROW_BTN,
  SCHEDULE_DATE_CHIP_ACTIVE,
  SCHEDULE_DATE_CHIP_IDLE,
  SCHEDULE_INK,
  SCHEDULE_MUTED,
} from "@/components/marketing/schedule/schedule-public-design";
import {
  addDays,
  isSameCalendarDay,
  startOfLocalDay,
} from "@/components/marketing/schedule/schedule-date-utils";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
} from "@/components/marketing/schedule/schedule-view-icons";

const VISIBLE_DAYS = 7;
const WINDOW_SHIFT = 7;

function formatWeekdayShort(locale: string, date: Date): string {
  return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date);
}

function formatMonthTitle(locale: string, date: Date): string {
  return new Intl.DateTimeFormat(locale, { month: "long" }).format(date);
}

function formatSelectedLong(locale: string, date: Date): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

type ScheduleDateControlsProps = {
  locale: string;
  selectedDate: Date;
  windowStart: Date;
  onSelectDay: (d: Date) => void;
  onShiftWindow: (delta: number) => void;
};

export function ScheduleDateControls({
  locale,
  selectedDate,
  windowStart,
  onSelectDay,
  onShiftWindow,
}: ScheduleDateControlsProps) {
  const t = useTranslations("marketingPages.schedule");
  const stripDays = Array.from({ length: VISIBLE_DAYS }, (_, idx) => addDays(windowStart, idx));
  const monthLabel = formatMonthTitle(locale, selectedDate);
  const selectedLong = formatSelectedLong(locale, selectedDate);

  return (
    <>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className={`text-lg font-semibold capitalize ${SCHEDULE_INK}`}>{monthLabel}</p>
        <Link
          href="/user/classes"
          className={`inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline ${SCHEDULE_INK}`}
        >
          <CalendarIcon />
          {t("fullCalendar")}
        </Link>
      </div>

      <div className="mt-4 flex max-w-full items-center gap-2 overflow-hidden">
        <button
          type="button"
          className={SCHEDULE_ARROW_BTN}
          aria-label={t("prevDatesAria")}
          onClick={() => onShiftWindow(-WINDOW_SHIFT)}
        >
          <ArrowLeftIcon />
        </button>
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {stripDays.map((day) => {
            const active = isSameCalendarDay(day, selectedDate);
            const dayNum = String(day.getDate());
            const wk = formatWeekdayShort(locale, day);
            return (
              <button
                key={day.getTime()}
                type="button"
                onClick={() => onSelectDay(startOfLocalDay(day))}
                className="flex shrink-0 flex-col items-center gap-1.5 px-0.5"
              >
                <span className={`text-[11px] font-medium uppercase tracking-wide ${SCHEDULE_MUTED}`}>
                  {wk}
                </span>
                <span className={active ? SCHEDULE_DATE_CHIP_ACTIVE : SCHEDULE_DATE_CHIP_IDLE}>
                  {dayNum}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className={SCHEDULE_ARROW_BTN}
          aria-label={t("nextDatesAria")}
          onClick={() => onShiftWindow(WINDOW_SHIFT)}
        >
          <ArrowRightIcon />
        </button>
      </div>

      <div className="mt-8 flex flex-col gap-1 border-b border-[#000000]/[0.06] pb-3 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-3">
        <p className={`text-lg font-semibold capitalize ${SCHEDULE_INK}`}>{selectedLong}</p>
        <p className={`text-xs leading-relaxed sm:max-w-md ${SCHEDULE_MUTED}`}>{t("timezoneNote")}</p>
      </div>
    </>
  );
}
