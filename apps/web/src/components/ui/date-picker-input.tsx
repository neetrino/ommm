"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  formatBirthdayInput,
  formatDateForUi,
  formatIsoDateToUi,
  parseBirthdayDisplayToIso,
} from "@/lib/date-display";
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
  /** Enables DD/MM/YYYY typing alongside the calendar picker. */
  allowManualEntry?: boolean;
  /** Skips the outer `ommm-input` shell for embedding in compact fields. */
  bare?: boolean;
  inputClassName?: string;
  containerClassName?: string;
  /** Hides the inline calendar button (e.g. when an external icon opens the picker). */
  showCalendarTrigger?: boolean;
};

export type DatePickerInputHandle = {
  openPicker: () => void;
  togglePicker: () => void;
};

const DEFAULT_MANUAL_INPUT_CLASS =
  "min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-sage-900 shadow-none placeholder:text-sage-500/60 focus:outline-none focus:ring-0";

export const DatePickerInput = forwardRef<DatePickerInputHandle, DatePickerInputProps>(
  function DatePickerInput(
    {
      id,
      name,
      value,
      onChange,
      disabled = false,
      required = false,
      ariaLabel,
      placeholder = "DD/MM/YYYY",
      allowManualEntry = false,
      bare = false,
      inputClassName = DEFAULT_MANUAL_INPUT_CLASS,
      containerClassName = "",
      showCalendarTrigger = true,
    },
    ref,
  ) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fieldShellRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const selectedDate = useMemo(() => parseIsoDate(value), [value]);
  const [isOpen, setIsOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState<DatePickerPopupPosition | null>(null);
  const [visibleMonth, setVisibleMonth] = useState<Date>(() =>
    startOfMonth(selectedDate ?? new Date()),
  );
  const [manualDraft, setManualDraft] = useState("");
  const [isManualFocused, setIsManualFocused] = useState(false);

  const closePicker = useCallback(() => {
    setIsOpen(false);
    setPopupPosition(null);
  }, []);

  const openPicker = useCallback(() => {
    if (disabled) {
      return;
    }
    setIsOpen(true);
    if (selectedDate !== null) {
      setVisibleMonth(startOfMonth(selectedDate));
    }
  }, [disabled, selectedDate]);

  const togglePicker = useCallback(() => {
    if (disabled) {
      return;
    }
    setIsOpen((prev) => {
      if (prev) {
        setPopupPosition(null);
        return false;
      }
      openPicker();
      return true;
    });
  }, [disabled, openPicker]);

  useImperativeHandle(
    ref,
    () => ({
      openPicker,
      togglePicker,
    }),
    [openPicker, togglePicker],
  );

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const resolvedManualDisplay = useMemo(() => {
    if (value.trim().length === 0) {
      return "";
    }
    return formatIsoDateToUi(value);
  }, [value]);

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
    const anchor = fieldShellRef.current ?? triggerRef.current;
    if (!isOpen || anchor === null || typeof window === "undefined") {
      return;
    }

    const rect = anchor.getBoundingClientRect();
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

  const commitManualDraft = useCallback(
    (draft: string) => {
      const trimmed = draft.trim();
      if (trimmed.length === 0) {
        onChange("");
        return;
      }
      const iso = parseBirthdayDisplayToIso(trimmed);
      onChange(iso ?? "");
    },
    [onChange],
  );

  const calendarPopup =
    isOpen && popupPosition !== null
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
      : null;

  const clearDateControl =
    selectedDate !== null ? (
      <span
        role="button"
        tabIndex={disabled ? -1 : 0}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[15px] leading-none text-sage-500 transition-colors hover:bg-sand-100 hover:text-sage-700"
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
    ) : null;

  const calendarTrigger = showCalendarTrigger ? (
    <button
      ref={triggerRef}
      type="button"
      className="inline-flex size-5 shrink-0 items-center justify-center rounded-md text-sage-500 transition-colors hover:bg-sand-100 hover:text-sage-700 disabled:pointer-events-none disabled:opacity-50"
      aria-label={ariaLabel}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      disabled={disabled}
      onClick={togglePicker}
    >
      <DatePickerCalendarGlyph className="h-4 w-4" />
    </button>
  ) : null;

  if (allowManualEntry) {
    const manualValue = isManualFocused ? manualDraft : resolvedManualDisplay;
    const fieldShellClass = bare
      ? `flex min-w-0 flex-1 items-center gap-1 ${containerClassName}`.trim()
      : `ommm-input flex items-center gap-2 ${containerClassName}`.trim();

    return (
      <div className={isOpen ? "relative z-[140]" : "relative"} ref={wrapperRef}>
        <input type="hidden" name={name} value={value} required={required} />
        <div className={fieldShellClass} ref={fieldShellRef}>
          <input
            id={id}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={10}
            className={inputClassName}
            value={manualValue}
            placeholder={placeholder}
            aria-label={ariaLabel}
            disabled={disabled}
            onFocus={() => {
              setManualDraft(resolvedManualDisplay);
              setIsManualFocused(true);
            }}
            onChange={(event) => {
              setManualDraft(formatBirthdayInput(event.target.value));
            }}
            onBlur={() => {
              commitManualDraft(manualDraft);
              setIsManualFocused(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitManualDraft(manualDraft);
                setIsManualFocused(false);
                event.currentTarget.blur();
              }
            }}
          />
          {clearDateControl}
          {calendarTrigger}
        </div>
        {calendarPopup}
      </div>
    );
  }

  const displayValue =
    selectedDate === null ? placeholder : formatDateForUi(selectedDate);

  return (
    <div className={isOpen ? "relative z-[140]" : "relative"} ref={wrapperRef}>
      <input type="hidden" name={name} value={value} required={required} />
      <div
        className={`ommm-input flex items-center justify-between gap-2 ${containerClassName}`.trim()}
        ref={fieldShellRef}
      >
        <button
          ref={triggerRef}
          id={id}
          type="button"
          className="min-w-0 flex-1 truncate border-0 bg-transparent p-0 text-left shadow-none focus:outline-none focus:ring-0 disabled:pointer-events-none disabled:opacity-50"
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          disabled={disabled}
          onClick={togglePicker}
        >
          <span className={selectedDate === null ? "text-sage-500/70" : "text-sage-900"}>
            {displayValue}
          </span>
        </button>
        <span className="inline-flex items-center gap-2 text-sage-500">
          {clearDateControl}
          <button
            type="button"
            className="inline-flex size-5 shrink-0 items-center justify-center rounded-md text-sage-500 transition-colors hover:bg-sand-100 hover:text-sage-700 disabled:pointer-events-none disabled:opacity-50"
            aria-label={ariaLabel}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            disabled={disabled}
            onClick={togglePicker}
          >
            <DatePickerCalendarGlyph className="h-4 w-4" />
          </button>
        </span>
      </div>
      {calendarPopup}
    </div>
  );
},
);
