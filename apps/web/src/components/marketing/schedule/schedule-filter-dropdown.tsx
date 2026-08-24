"use client";

import {
  SCHEDULE_FILTER_LABEL,
  SCHEDULE_FILTER_MENU,
  SCHEDULE_FILTER_MENU_MAX_HEIGHT_PX,
  SCHEDULE_FILTER_MENU_MIN_WIDTH_PX,
  SCHEDULE_FILTER_ROOT,
  SCHEDULE_FILTER_TRIGGER,
} from "@/components/marketing/schedule/schedule-public-design";
import {
  DropdownSelect,
  type DropdownOption,
} from "@/components/ui/dropdown-select";
import type { FloatingMenuAlign } from "@/components/ui/use-floating-menu-position";

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
  className?: string;
  menuAlign?: FloatingMenuAlign;
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
  className,
  menuAlign = "end",
  name,
  disabled = false,
  required = false,
  openOnHover = false,
}: ScheduleFilterDropdownProps<T>) {
  const selected = options.find((option) => option.value === value);

  return (
    <DropdownSelect
      className={className ?? SCHEDULE_FILTER_ROOT}
      label={selected?.label ?? label}
      ariaLabel={ariaLabel}
      value={value}
      options={options}
      onChange={onChange}
      name={name}
      disabled={disabled}
      required={required}
      openOnHover={openOnHover}
      animateMenuDismiss
      menuMinWidth={SCHEDULE_FILTER_MENU_MIN_WIDTH_PX}
      menuMaxHeight={SCHEDULE_FILTER_MENU_MAX_HEIGHT_PX}
      menuAlign={menuAlign}
      menuClassName={SCHEDULE_FILTER_MENU}
      triggerClassName={SCHEDULE_FILTER_TRIGGER}
      renderValue={(option) => (
        <span className={SCHEDULE_FILTER_LABEL}>{option?.label ?? label}</span>
      )}
      resolveOptionSelected={isScheduleFilterOptionSelected}
    />
  );
}
