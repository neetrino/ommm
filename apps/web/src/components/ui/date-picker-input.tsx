"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const MONDAY_ANCHOR_DATE = new Date(2024, 0, 1);
const POPUP_MAX_WIDTH = 292;
const POPUP_MIN_WIDTH = 248;
const POPUP_EDGE_MARGIN = 8;
const POPUP_GAP = 8;
const FALLBACK_POPUP_HEIGHT = 320;

export type DatePickerInputProps = {
  id?: string;
  name: string;
  value: string;
  onChange: (nextValue: string) => void;
  disabled?: boolean;
  required?: boolean;
  ariaLabel?: string;
  placeholder?: string;
};

type PopupPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

function parseIsoDate(value: string): Date | null {
  const parts = value.split("-");
  if (parts.length !== 3) {
    return null;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function formatIsoDate(value: Date): string {
  const year = String(value.getFullYear());
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function isSameCalendarDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getGridStartDate(visibleMonth: Date): Date {
  const monthStart = startOfMonth(visibleMonth);
  const weekdayFromMonday = (monthStart.getDay() + 6) % 7;
  return addDays(monthStart, -weekdayFromMonday);
}

function getGridEndDate(visibleMonth: Date): Date {
  const monthEnd = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  );
  const weekday = monthEnd.getDay();
  const daysToSunday = weekday === 0 ? 0 : 7 - weekday;
  return addDays(monthEnd, daysToSunday);
}

function ChevronLeft() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function CalendarGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.85}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M8 2v4m8-4v4" />
      <rect x="3" y="4.5" width="18" height="16" rx="3" />
      <path d="M3 9h18" />
    </svg>
  );
}

export function DatePickerInput({
  id,
  name,
  value,
  onChange,
  disabled = false,
  required = false,
  ariaLabel,
  placeholder = "Select date",
}: DatePickerInputProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const selectedDate = useMemo(() => parseIsoDate(value), [value]);
  const [isOpen, setIsOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null);
  const [visibleMonth, setVisibleMonth] = useState<Date>(() =>
    startOfMonth(selectedDate ?? new Date()),
  );

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  useEffect(() => {
    if (selectedDate !== null) {
      setVisibleMonth(startOfMonth(selectedDate));
    }
  }, [selectedDate]);

  useEffect(() => {
    if (!isOpen) {
      setPopupPosition(null);
      return;
    }

    function onDocumentPointerDown(event: PointerEvent): void {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (wrapperRef.current?.contains(target)) {
        return;
      }
      if (popupRef.current?.contains(target)) {
        return;
      }
      setIsOpen(false);
    }

    function onDocumentKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", onDocumentPointerDown);
    document.addEventListener("keydown", onDocumentKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onDocumentPointerDown);
      document.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, [isOpen]);

  const updatePopupPosition = useCallback(() => {
    if (!isOpen || triggerRef.current === null || typeof window === "undefined") {
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = Math.max(
      POPUP_MIN_WIDTH,
      Math.min(POPUP_MAX_WIDTH, Math.floor(viewportWidth * 0.88)),
    );
    const popupHeight = popupRef.current?.offsetHeight ?? FALLBACK_POPUP_HEIGHT;
    const availableBelow = viewportHeight - rect.bottom - POPUP_GAP - POPUP_EDGE_MARGIN;
    const availableAbove = rect.top - POPUP_GAP - POPUP_EDGE_MARGIN;
    const shouldOpenUpward =
      availableBelow < popupHeight && availableAbove > availableBelow;

    const left = Math.max(
      POPUP_EDGE_MARGIN,
      Math.min(rect.left, viewportWidth - width - POPUP_EDGE_MARGIN),
    );
    const top = shouldOpenUpward
      ? Math.max(POPUP_EDGE_MARGIN, rect.top - popupHeight - POPUP_GAP)
      : Math.min(
          rect.bottom + POPUP_GAP,
          viewportHeight - popupHeight - POPUP_EDGE_MARGIN,
        );

    setPopupPosition({
      top,
      left,
      width,
      maxHeight: viewportHeight - POPUP_EDGE_MARGIN * 2,
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updatePopupPosition();
    const rafId = window.requestAnimationFrame(() => {
      updatePopupPosition();
    });

    window.addEventListener("resize", updatePopupPosition);
    window.addEventListener("scroll", updatePopupPosition, true);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updatePopupPosition);
      window.removeEventListener("scroll", updatePopupPosition, true);
    };
  }, [isOpen, updatePopupPosition]);

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(visibleMonth),
    [visibleMonth],
  );

  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const base = addDays(MONDAY_ANCHOR_DATE, index);
        return new Intl.DateTimeFormat(undefined, { weekday: "short" })
          .format(base)
          .slice(0, 3)
          .toUpperCase();
      }),
    [],
  );

  const calendarDays = useMemo(() => {
    const start = getGridStartDate(visibleMonth);
    const end = getGridEndDate(visibleMonth);
    const totalDays = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
    return Array.from({ length: totalDays }, (_, index) => addDays(start, index));
  }, [visibleMonth]);

  const displayValue =
    selectedDate === null
      ? placeholder
      : new Intl.DateTimeFormat(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(selectedDate);

  return (
    <div className={isOpen ? "relative z-[140]" : "relative"} ref={wrapperRef}>
      <input type="hidden" name={name} value={value} />
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className="ommm-input flex min-h-11 items-center justify-between gap-2 text-left"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-required={required}
        disabled={disabled}
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
      >
        <span
          className={`truncate ${selectedDate === null ? "text-sage-500/70" : "text-sage-900"}`}
        >
          {displayValue}
        </span>
        <span className="inline-flex items-center gap-2 text-sage-500">
          {selectedDate !== null ? (
            <span
              role="button"
              tabIndex={disabled ? -1 : 0}
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[15px] leading-none transition-colors hover:bg-sand-100 hover:text-sage-700"
              onClick={(event) => {
                event.stopPropagation();
                if (!disabled) {
                  onChange("");
                }
              }}
              onKeyDown={(event) => {
                if (disabled) {
                  return;
                }
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange("");
                }
              }}
              aria-label="Clear date"
            >
              x
            </span>
          ) : null}
          <CalendarGlyph />
        </span>
      </button>

      {isOpen && popupPosition !== null
        ? createPortal(
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
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sand-500/20 text-sage-700 transition-colors hover:bg-sand-50"
              aria-label="Previous month"
              onClick={() => {
                setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
              }}
            >
              <ChevronLeft />
            </button>
            <p className="text-xl font-semibold text-sage-900">{monthLabel}</p>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sand-500/20 text-sage-700 transition-colors hover:bg-sand-50"
              aria-label="Next month"
              onClick={() => {
                setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
              }}
            >
              <ChevronRight />
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
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;

              const textTone = !isInCurrentMonth
                ? "text-sage-400"
                : isSelected
                  ? "text-white"
                  : isWeekend
                    ? "text-rose-500"
                    : "text-sage-900";

              const backgroundTone = isSelected ? "bg-[#2f39a6]" : "bg-transparent";
              const todayRing =
                isToday && !isSelected ? "ring-1 ring-sand-500/35 ring-inset" : "";
              const mutedOldMonthTone = !isInCurrentMonth ? "opacity-65" : "";

              return (
                <button
                  key={formatIsoDate(day)}
                  type="button"
                  className={`mx-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors hover:bg-sand-50 ${textTone} ${backgroundTone} ${todayRing} ${mutedOldMonthTone}`}
                  onClick={() => {
                    onChange(formatIsoDate(day));
                    setIsOpen(false);
                  }}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 flex items-center justify-between border-t border-sand-500/20 px-1 pt-2.5">
            <button
              type="button"
              className="text-base font-medium text-[#2f39a6] transition-opacity hover:opacity-80"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="text-base font-medium text-[#2f39a6] transition-opacity hover:opacity-80"
              onClick={() => {
                onChange(formatIsoDate(today));
                setVisibleMonth(startOfMonth(today));
                setIsOpen(false);
              }}
            >
              Today
            </button>
          </div>
        </div>,
        document.body,
      )
        : null}
    </div>
  );
}
