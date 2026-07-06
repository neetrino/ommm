"use client";

import {
  DropdownSelect,
  type DropdownOption,
} from "@/components/ui/dropdown-select";

export type ScheduleFilterOption<T extends string> = DropdownOption<T>;

const SCHEDULE_FILTER_ALL_VALUE = "all";

function isScheduleFilterOptionSelected<T extends string>(
  option: DropdownOption<T>,
  value: T,
): boolean {
  return value === SCHEDULE_FILTER_ALL_VALUE || option.value === value;
}

type ScheduleFilterDropdownProps<T extends string> = {
  label: string;
  ariaLabel: string;
  value: T;
  options: readonly ScheduleFilterOption<T>[];
  onChange: (value: T) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  openOnHover?: boolean;
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
  openOnHover = false,
}: ScheduleFilterDropdownProps<T>) {
  const selected = options.find((option) => option.value === value);

  return (
    <DropdownSelect
      label={selected?.label ?? label}
      ariaLabel={ariaLabel}
      value={value}
      options={options}
      onChange={onChange}
      name={name}
      disabled={disabled}
      required={required}
      openOnHover={openOnHover}
      resolveOptionSelected={isScheduleFilterOptionSelected}
    />
  );
}
