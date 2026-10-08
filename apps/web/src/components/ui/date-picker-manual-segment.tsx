"use client";

import type { ClipboardEvent, FocusEvent, KeyboardEvent } from "react";
import {
  dateSegmentMaxLength,
  type DateSegmentPart,
} from "@/components/ui/date-picker-manual-entry";

const SEGMENT_FIELD_CLASS = [
  "!min-w-0 !flex-none rounded-md text-center font-medium tabular-nums",
  "transition-colors focus:bg-sand-100",
].join(" ");

const SEGMENT_WIDTH_CLASS: Record<DateSegmentPart, string> = {
  day: `!w-7 ${SEGMENT_FIELD_CLASS}`,
  month: `!w-7 ${SEGMENT_FIELD_CLASS}`,
  year: `!w-12 ${SEGMENT_FIELD_CLASS}`,
};

const DATE_SEGMENT_SLASH_CLASS = "select-none text-sm leading-none text-sage-300";

const SEGMENT_LABEL_CLASS =
  "text-[10px] font-semibold uppercase leading-none tracking-[0.08em] text-sage-400";

type DateSegmentColumnProps = {
  id?: string;
  part: DateSegmentPart;
  index: number;
  label: string | null;
  disabled: boolean;
  inputClassName: string;
  value: string;
  placeholder: string;
  ariaLabel: string;
  onFocus: () => void;
  onChange: (rawValue: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
};

export function DateSegmentColumn(props: DateSegmentColumnProps) {
  const labeled = props.label !== null;
  return (
    <span className={labeled ? "inline-flex items-end" : "inline-flex items-center"}>
      {props.index > 0 ? <DateSegmentSlash labeled={labeled} /> : null}
      <span className={labeled ? "inline-flex flex-col items-center gap-1" : "inline-flex"}>
        {props.label !== null ? <span className={SEGMENT_LABEL_CLASS}>{props.label}</span> : null}
        <DateSegmentInput {...props} />
      </span>
    </span>
  );
}

function DateSegmentSlash({ labeled }: { labeled: boolean }) {
  const slashClass = labeled
    ? `${DATE_SEGMENT_SLASH_CLASS} px-0.5 pb-1.5`
    : DATE_SEGMENT_SLASH_CLASS;
  return (
    <span className={slashClass} aria-hidden="true">
      /
    </span>
  );
}

function DateSegmentInput({
  id,
  part,
  disabled,
  inputClassName,
  value,
  placeholder,
  ariaLabel,
  onFocus,
  onChange,
  onKeyDown,
  onPaste,
  onBlur,
}: DateSegmentColumnProps) {
  return (
    <input
      id={id}
      data-date-part={part}
      type="text"
      size={part === "year" ? 4 : 2}
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      maxLength={dateSegmentMaxLength(part)}
      disabled={disabled}
      className={`${inputClassName} ${SEGMENT_WIDTH_CLASS[part]}`}
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onFocus={onFocus}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      onBlur={onBlur}
    />
  );
}
