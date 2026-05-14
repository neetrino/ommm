"use client";

import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";

export type ScheduleFilterOption<T extends string> = DropdownOption<T>;

type ScheduleFilterDropdownProps<T extends string> = {
  label: string;
  ariaLabel: string;
  value: T;
  options: readonly ScheduleFilterOption<T>[];
  onChange: (value: T) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
};

export function ScheduleFilterDropdown<T extends string>({
  label,
  ariaLabel,
  value,
  options,
  onChange,
  name,
  disabled = false,
  required = false,
}: ScheduleFilterDropdownProps<T>) {
  return (
    <DropdownSelect
      label={label}
      ariaLabel={ariaLabel}
      value={value}
      options={options}
      onChange={onChange}
      name={name}
      disabled={disabled}
      required={required}
    />
  );
}
