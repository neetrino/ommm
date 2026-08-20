"use client";

import { useMemo } from "react";
import {
  addDays,
  DATE_PICKER_CALENDAR_FOOTER_ACTION_CLASS,
  DATE_PICKER_MONDAY_ANCHOR_DATE,
  formatIsoDate,
  isBeforeCalendarDate,
  isSameCalendarDate,
  startOfMonth,
  type DatePickerPopupPosition,
} from "@/components/ui/date-picker-utils";
import {
  DatePickerChevronLeft,
  DatePickerChevronRight,
} from "@/components/ui/date-picker-icons";

type DatePickerCalendarPopupProps = {
  popupRef: React.RefObject<HTMLDivElement | null>;
  popupPosition: DatePickerPopupPosition;
  visibleMonth: Date;
  selectedDate: Date | null;
  today: Date;
  minDate?: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (isoDate: string) => void;
  onClear: () => void;
  onSelectToday: () => void;
};

export function DatePickerCalendarPopup({
  popupRef,
  popupPosition,
  visibleMonth,
  selectedDate,
  today,
  minDate,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  onClear,
  onSelectToday,
}: DatePickerCalendarPopupProps) {
  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(visibleMonth),
    [visibleMonth],
  );

  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const base = addDays(DATE_PICKER_MONDAY_ANCHOR_DATE, index);
        return new Intl.DateTimeFormat(undefined, { weekday: "short" })
          .format(base)
          .slice(0, 3)
          .toUpperCase();
      }),
    [],
  );

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(visibleMonth);
    const weekdayFromMonday = (monthStart.getDay() + 6) % 7;
    const start = addDays(monthStart, -weekdayFromMonday);
    const monthEnd = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
      0,
    );
    const weekday = monthEnd.getDay();
    const daysToSunday = weekday === 0 ? 0 : 7 - weekday;
    const end = addDays(monthEnd, daysToSunday);
    const totalDays = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
    return Array.from({ length: totalDays }, (_, index) => addDays(start, index));
  }, [visibleMonth]);

  const canGoToPreviousMonth =
    minDate === undefined ||
    startOfMonth(visibleMonth).getTime() > startOfMonth(minDate).getTime();

  return (
    <div
      ref={popupRef}
      role="dialog"
      aria-label="Date picker calendar"
      className="z-[1500] overflow-auto rounded-[24px] border border-sand-500/20 bg-white p-3 shadow-[0_28px_56px_-28px_rgba(45,40,35,0.45)]"
      style={{
        position: "fixed",
        top: popupPosition.top,
        left: popupPosition.left,
        width: popupPosition.width,
        maxHeight: popupPosition.maxHeight,
      }}
    >
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sand-500/20 text-sage-700 transition-colors hover:bg-sand-50 disabled:pointer-events-none disabled:opacity-40"
          aria-label="Previous month"
          disabled={!canGoToPreviousMonth}
          onClick={onPrevMonth}
        >
          <DatePickerChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-xl font-semibold text-sage-900">{monthLabel}</p>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sand-500/20 text-sage-700 transition-colors hover:bg-sand-50"
          aria-label="Next month"
          onClick={onNextMonth}
        >
          <DatePickerChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2.5 grid grid-cols-7 gap-y-1 text-center text-[10px] font-medium tracking-wide text-sage-500">
        {weekdayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-y-0.5">
        {calendarDays.map((day) => {
          const isInCurrentMonth = day.getMonth() === visibleMonth.getMonth();
          const isSelected = selectedDate !== null && isSameCalendarDate(day, selectedDate);
          const isToday = isSameCalendarDate(day, today);
          const isDisabled = minDate !== undefined && isBeforeCalendarDate(day, minDate);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          const textTone = isSelected
            ? "text-white"
            : isDisabled
              ? "text-sage-300"
              : !isInCurrentMonth
                ? "text-sage-400"
                : isWeekend
                  ? "text-rose-500"
                  : "text-sage-900";

          const backgroundTone = isSelected ? "bg-[#2f39a6]" : "bg-transparent";
          const todayRing =
            isToday && !isSelected ? "ring-1 ring-sand-500/35 ring-inset" : "";
          const mutedOldMonthTone = !isInCurrentMonth || isDisabled ? "opacity-65" : "";

          return (
            <button
              key={formatIsoDate(day)}
              type="button"
              disabled={isDisabled}
              className={`mx-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${isDisabled ? "cursor-not-allowed" : "hover:bg-sand-50"} ${textTone} ${backgroundTone} ${todayRing} ${mutedOldMonthTone}`}
              onClick={() => {
                if (!isDisabled) {
                  onSelectDate(formatIsoDate(day));
                }
              }}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-sand-500/20 px-1 pt-2.5">
        <button type="button" className={DATE_PICKER_CALENDAR_FOOTER_ACTION_CLASS} onClick={onClear}>
          Clear
        </button>
        <button type="button" className={DATE_PICKER_CALENDAR_FOOTER_ACTION_CLASS} onClick={onSelectToday}>
          Today
        </button>
      </div>
    </div>
  );
}
