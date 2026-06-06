"use client";

import { DatePickerInput } from "@/components/ui/date-picker-input";
import { TimePickerInput } from "@/components/ui/time-picker-input";

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
      <div className="shrink-0">
        <TimePickerInput
          name={`${dateName}-time`}
          ariaLabel={timeAriaLabel}
          value={timeValue}
          onChange={onTimeChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
