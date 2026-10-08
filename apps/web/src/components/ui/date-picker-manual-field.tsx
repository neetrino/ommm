"use client";

import {
  useRef,
  useState,
  type ClipboardEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MutableRefObject,
  type RefObject,
} from "react";
import {
  DATE_SEGMENT_PARTS,
  dateSegmentMaxLength,
  dateSegmentsFromIso,
  dateSegmentsFromPastedText,
  dateSegmentsToIso,
  nextDateSegment,
  previousDateSegment,
  replaceDateSegment,
  type DateSegmentPart,
  type DateSegments,
} from "@/components/ui/date-picker-manual-entry";
import { isBeforeCalendarDate, parseIsoDate } from "@/components/ui/date-picker-utils";

const SEGMENT_WIDTH_CLASS: Record<DateSegmentPart, string> = {
  day: "!w-[3ch] !min-w-[3ch] !flex-none text-center",
  month: "!w-[3ch] !min-w-[3ch] !flex-none text-center",
  year: "!w-[5.5ch] !min-w-[5.5ch] !flex-none text-center",
};

const SEGMENT_PLACEHOLDER: Record<DateSegmentPart, string> = {
  day: "DD",
  month: "MM",
  year: "YYYY",
};

type DatePickerManualFieldProps = {
  id?: string;
  value: string;
  onChange: (nextValue: string) => void;
  disabled: boolean;
  ariaLabel?: string;
  placeholder: string;
  inputClassName: string;
  minDate?: Date;
};

type ManualDateDraft = {
  groupRef: RefObject<HTMLDivElement | null>;
  dayRef: RefObject<HTMLInputElement | null>;
  monthRef: RefObject<HTMLInputElement | null>;
  yearRef: RefObject<HTMLInputElement | null>;
  segments: DateSegments;
  focusPart: (part: DateSegmentPart | null) => void;
  handleSegmentChange: (part: DateSegmentPart, rawValue: string) => void;
  handlePaste: (event: ClipboardEvent<HTMLInputElement>) => void;
  handleBlur: (event: FocusEvent<HTMLInputElement>) => void;
  handleFocus: () => void;
};

function placeholderFor(placeholder: string, part: DateSegmentPart): string {
  const [day, month, year] = placeholder.split("/");
  if (part === "day" && day !== undefined && day.length > 0) {
    return day;
  }
  if (part === "month" && month !== undefined && month.length > 0) {
    return month;
  }
  if (part === "year" && year !== undefined && year.length > 0) {
    return year;
  }
  return SEGMENT_PLACEHOLDER[part];
}

function isBlockedByMinDate(isoValue: string, minDate: Date | undefined): boolean {
  if (isoValue.length === 0 || minDate === undefined) {
    return false;
  }
  const parsed = parseIsoDate(isoValue);
  return parsed !== null && isBeforeCalendarDate(parsed, minDate);
}

function shouldAdvanceSegment(previous: string, next: string, part: DateSegmentPart): boolean {
  return next.length > previous.length && next.length === dateSegmentMaxLength(part);
}

function commitVisibleDraft(
  draft: DateSegments | null,
  value: string,
  minDate: Date | undefined,
  onChange: (nextValue: string) => void,
): void {
  const current = draft ?? dateSegmentsFromIso(value);
  const next = dateSegmentsToIso(current);
  if (next !== null && next !== value && !isBlockedByMinDate(next, minDate)) {
    onChange(next);
  }
}

function applySegmentEdit(
  draftRef: MutableRefObject<DateSegments | null>,
  value: string,
  part: DateSegmentPart,
  rawValue: string,
  setDraft: (next: DateSegments) => void,
  focusPart: (nextPart: DateSegmentPart | null) => void,
): void {
  const base = draftRef.current ?? dateSegmentsFromIso(value);
  const next = replaceDateSegment(base, part, rawValue);
  draftRef.current = next;
  setDraft(next);
  if (shouldAdvanceSegment(base[part], next[part], part)) {
    focusPart(nextDateSegment(part));
  }
}

function applyPastedDate(
  event: ClipboardEvent<HTMLInputElement>,
  draftRef: MutableRefObject<DateSegments | null>,
  setDraft: (next: DateSegments) => void,
  focusPart: (part: DateSegmentPart | null) => void,
): void {
  const pasted = dateSegmentsFromPastedText(event.clipboardData.getData("text"));
  if (pasted === null) {
    return;
  }
  event.preventDefault();
  draftRef.current = pasted;
  setDraft(pasted);
  focusPart("year");
}

function blurDateDraft(
  event: FocusEvent<HTMLInputElement>,
  group: HTMLDivElement | null,
  draftRef: MutableRefObject<DateSegments | null>,
  value: string,
  minDate: Date | undefined,
  onChange: (nextValue: string) => void,
  setDraft: (next: DateSegments | null) => void,
): void {
  const nextTarget = event.relatedTarget ?? document.activeElement;
  if (nextTarget instanceof Node && group?.contains(nextTarget)) {
    return;
  }
  const current = draftRef.current;
  draftRef.current = null;
  setDraft(null);
  commitVisibleDraft(current, value, minDate, onChange);
}

function useManualDateDraft(
  value: string,
  onChange: (nextValue: string) => void,
  minDate: Date | undefined,
): ManualDateDraft {
  const groupRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<DateSegments | null>(null);
  const draftRef = useRef<DateSegments | null>(null);

  function focusPart(part: DateSegmentPart | null): void {
    const target = part === "day" ? dayRef : part === "month" ? monthRef : yearRef;
    if (part !== null) {
      target.current?.focus();
    }
  }

  return {
    groupRef,
    dayRef,
    monthRef,
    yearRef,
    segments: draft ?? dateSegmentsFromIso(value),
    focusPart,
    handleSegmentChange(part, rawValue) {
      applySegmentEdit(draftRef, value, part, rawValue, setDraft, focusPart);
    },
    handlePaste(event) {
      applyPastedDate(event, draftRef, setDraft, focusPart);
    },
    handleBlur(event) {
      blurDateDraft(event, groupRef.current, draftRef, value, minDate, onChange, setDraft);
    },
    handleFocus() {
      if (draftRef.current !== null) {
        return;
      }
      const next = dateSegmentsFromIso(value);
      draftRef.current = next;
      setDraft(next);
    },
  };
}

function handleSegmentKeyDown(
  part: DateSegmentPart,
  event: KeyboardEvent<HTMLInputElement>,
  focusPart: (nextPart: DateSegmentPart | null) => void,
): void {
  const input = event.currentTarget;
  const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
  if (event.key === "Backspace" && atStart) {
    event.preventDefault();
    focusPart(previousDateSegment(part));
    return;
  }
  if (event.key === "/" || event.key === "." || event.key === "-") {
    event.preventDefault();
    focusPart(nextDateSegment(part));
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    input.blur();
  }
}

export function DatePickerManualField({
  id,
  value,
  onChange,
  disabled,
  ariaLabel,
  placeholder,
  inputClassName,
  minDate,
}: DatePickerManualFieldProps) {
  const draft = useManualDateDraft(value, onChange, minDate);

  return (
    <div ref={draft.groupRef} className="flex min-w-0 flex-1 flex-nowrap items-center">
      {DATE_SEGMENT_PARTS.map((part, index) => (
        <span key={part} className="inline-flex items-center">
          {index > 0 ? (
            <span className="select-none px-px text-sm text-sage-400" aria-hidden="true">
              /
            </span>
          ) : null}
          <input
            id={part === "day" ? id : undefined}
            ref={part === "day" ? draft.dayRef : part === "month" ? draft.monthRef : draft.yearRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            maxLength={dateSegmentMaxLength(part)}
            disabled={disabled}
            className={`${inputClassName} ${SEGMENT_WIDTH_CLASS[part]}`}
            value={draft.segments[part]}
            placeholder={placeholderFor(placeholder, part)}
            aria-label={ariaLabel === undefined ? part : `${ariaLabel} ${part}`}
            onFocus={draft.handleFocus}
            onChange={(event) => draft.handleSegmentChange(part, event.target.value)}
            onKeyDown={(event) => handleSegmentKeyDown(part, event, draft.focusPart)}
            onPaste={draft.handlePaste}
            onBlur={draft.handleBlur}
          />
        </span>
      ))}
    </div>
  );
}
