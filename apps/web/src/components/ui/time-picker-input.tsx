"use client";

import { useRef, type KeyboardEvent } from "react";
import { combineTimeInputValue, splitTimeInputValue } from "@/lib/date-display";

export type TimePickerInputProps = {
  id?: string;
  name: string;
  value: string;
  onChange: (nextValue: string) => void;
  disabled?: boolean;
  required?: boolean;
  ariaLabel?: string;
};

function ClockGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.85}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-sage-500"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function isDigitKey(key: string): boolean {
  return /^\d$/.test(key);
}

function isAllSelected(input: HTMLInputElement, length: number): boolean {
  return input.selectionStart === 0 && input.selectionEnd === length;
}

export function TimePickerInput({
  id,
  name,
  value,
  onChange,
  disabled = false,
  required = false,
  ariaLabel,
}: TimePickerInputProps) {
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  const { hours, minutes } = splitTimeInputValue(value);

  const updateHours = (raw: string, advanceToMinutes = true) => {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    onChange(combineTimeInputValue(digits, minutes));
    if (advanceToMinutes && digits.length === 2) {
      minuteRef.current?.focus();
    }
  };

  const updateMinutes = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    onChange(combineTimeInputValue(hours, digits));
  };

  const handleSegmentDigitKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    current: string,
    onUpdate: (raw: string, advance?: boolean) => void,
  ) => {
    if (!isDigitKey(event.key) || current.length < 2) {
      return;
    }

    const input = event.currentTarget;
    if (isAllSelected(input, current.length)) {
      return;
    }

    event.preventDefault();
    onUpdate(event.key, false);
  };

  return (
    <div className="flex items-center gap-1.5">
      <input type="hidden" name={name} value={value} required={required} />
      <input
        ref={hourRef}
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className="ommm-input min-h-11 w-[3.25rem] shrink-0 text-center tabular-nums"
        aria-label={ariaLabel ? `${ariaLabel} hours` : "Hours"}
        placeholder="HH"
        value={hours}
        disabled={disabled}
        maxLength={2}
        onFocus={(event) => {
          event.target.select();
        }}
        onChange={(event) => {
          updateHours(event.target.value);
        }}
        onKeyDown={(event) => {
          handleSegmentDigitKeyDown(event, hours, updateHours);
        }}
      />
      <span className="text-sage-500" aria-hidden>
        :
      </span>
      <input
        ref={minuteRef}
        id={id ? `${id}-minutes` : undefined}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        className="ommm-input min-h-11 w-[3.25rem] shrink-0 text-center tabular-nums"
        aria-label={ariaLabel ? `${ariaLabel} minutes` : "Minutes"}
        placeholder="MM"
        value={minutes}
        disabled={disabled}
        maxLength={2}
        onFocus={(event) => {
          event.target.select();
        }}
        onChange={(event) => {
          updateMinutes(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Backspace" && minutes === "") {
            hourRef.current?.focus();
            return;
          }
          handleSegmentDigitKeyDown(event, minutes, (raw) => {
            updateMinutes(raw);
          });
        }}
      />
      <ClockGlyph />
    </div>
  );
}
