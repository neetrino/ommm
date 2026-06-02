"use client";

import { DatePickerInput } from "@/components/ui/date-picker-input";

export type DateTimePickerFieldsProps = {
  dateName: string;
  dateValue: string;
  timeValue: string;
  onDateChange: (nextValue: string) => void;
  onTimeChange: (nextValue: string) => void;
  dateAriaLabel: string;
  timeAriaLabel: string;
  datePlaceholder?: string;
  disabled?: boolean;
  className?: string;
};

export function DateTimePickerFields({
  dateName,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  dateAriaLabel,
  timeAriaLabel,
  datePlaceholder = "DD/MM/YYYY",
  disabled = false,
  className = "flex flex-wrap items-center gap-2",
}: DateTimePickerFieldsProps) {
  return (
    <div className={className}>
      <div className="min-w-[11rem] flex-1">
        <DatePickerInput
          name={dateName}
          ariaLabel={dateAriaLabel}
          placeholder={datePlaceholder}
          value={dateValue}
          onChange={onDateChange}
          disabled={disabled}
        />
      </div>
      <input
        type="time"
        className="ommm-input h-11 w-[8.5rem] shrink-0"
        aria-label={timeAriaLabel}
        value={timeValue}
        onChange={(event) => onTimeChange(event.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
