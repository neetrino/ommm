"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatDateForUi } from "@/lib/date-display";
import { DatePickerCalendarPopup } from "@/components/ui/date-picker-calendar-popup";
import { DatePickerCalendarGlyph } from "@/components/ui/date-picker-icons";
import {
  DATE_PICKER_FALLBACK_POPUP_HEIGHT,
  DATE_PICKER_POPUP_EDGE_MARGIN,
  DATE_PICKER_POPUP_GAP,
  DATE_PICKER_POPUP_MAX_WIDTH,
  DATE_PICKER_POPUP_MIN_WIDTH,
  formatIsoDate,
  parseIsoDate,
  startOfMonth,
  type DatePickerPopupPosition,
} from "@/components/ui/date-picker-utils";

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

export function DatePickerInput({
  id,
  name,
  value,
  onChange,
  disabled = false,
  required = false,
  ariaLabel,
  placeholder = "DD/MM/YYYY",
}: DatePickerInputProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const selectedDate = useMemo(() => parseIsoDate(value), [value]);
  const [isOpen, setIsOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState<DatePickerPopupPosition | null>(null);
  const [visibleMonth, setVisibleMonth] = useState<Date>(() =>
    startOfMonth(selectedDate ?? new Date()),
  );
  const closePicker = useCallback(() => {
    setIsOpen(false);
    setPopupPosition(null);
  }, []);

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  useEffect(() => {
    if (!isOpen) {
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
      closePicker();
    }

    function onDocumentKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        closePicker();
      }
    }

    document.addEventListener("pointerdown", onDocumentPointerDown);
    document.addEventListener("keydown", onDocumentKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onDocumentPointerDown);
      document.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, [closePicker, isOpen]);

  const updatePopupPosition = useCallback(() => {
    if (!isOpen || triggerRef.current === null || typeof window === "undefined") {
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = Math.max(
      DATE_PICKER_POPUP_MIN_WIDTH,
      Math.min(DATE_PICKER_POPUP_MAX_WIDTH, Math.floor(viewportWidth * 0.88)),
    );
    const popupHeight = popupRef.current?.offsetHeight ?? DATE_PICKER_FALLBACK_POPUP_HEIGHT;
    const availableBelow = viewportHeight - rect.bottom - DATE_PICKER_POPUP_GAP - DATE_PICKER_POPUP_EDGE_MARGIN;
    const availableAbove = rect.top - DATE_PICKER_POPUP_GAP - DATE_PICKER_POPUP_EDGE_MARGIN;
    const shouldOpenUpward =
      availableBelow < popupHeight && availableAbove > availableBelow;

    const left = Math.max(
      DATE_PICKER_POPUP_EDGE_MARGIN,
      Math.min(rect.left, viewportWidth - width - DATE_PICKER_POPUP_EDGE_MARGIN),
    );
    const top = shouldOpenUpward
      ? Math.max(DATE_PICKER_POPUP_EDGE_MARGIN, rect.top - popupHeight - DATE_PICKER_POPUP_GAP)
      : Math.min(
          rect.bottom + DATE_PICKER_POPUP_GAP,
          viewportHeight - popupHeight - DATE_PICKER_POPUP_EDGE_MARGIN,
        );

    setPopupPosition({
      top,
      left,
      width,
      maxHeight: viewportHeight - DATE_PICKER_POPUP_EDGE_MARGIN * 2,
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

  const displayValue =
    selectedDate === null ? placeholder : formatDateForUi(selectedDate);

  return (
    <div className={isOpen ? "relative z-[140]" : "relative"} ref={wrapperRef}>
      <input type="hidden" name={name} value={value} required={required} />
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className="ommm-input flex min-h-11 items-center justify-between gap-2 text-left"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => {
          setIsOpen((prev) => {
            const nextOpen = !prev;
            if (nextOpen) {
              if (selectedDate !== null) {
                setVisibleMonth(startOfMonth(selectedDate));
              }
            } else {
              setPopupPosition(null);
            }
            return nextOpen;
          });
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
          <DatePickerCalendarGlyph />
        </span>
      </button>

      {isOpen && popupPosition !== null
        ? createPortal(
            <DatePickerCalendarPopup
              popupRef={popupRef}
              popupPosition={popupPosition}
              visibleMonth={visibleMonth}
              selectedDate={selectedDate}
              today={today}
              onPrevMonth={() => {
                setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
              }}
              onNextMonth={() => {
                setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
              }}
              onSelectDate={(isoDate) => {
                onChange(isoDate);
                closePicker();
              }}
              onClear={() => {
                onChange("");
                closePicker();
              }}
              onSelectToday={() => {
                onChange(formatIsoDate(today));
                setVisibleMonth(startOfMonth(today));
                closePicker();
              }}
            />,
            document.body,
          )
        : null}
    </div>
  );
}
