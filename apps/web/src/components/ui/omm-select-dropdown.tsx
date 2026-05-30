"use client";

import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";

export type OmmSelectOption<T extends string = string> = DropdownOption<T>;

const OMM_TRIGGER_CLASS =
  "ommm-input min-h-10 py-2 pr-9 text-left [appearance:none]";

export type OmmSelectDropdownProps<T extends string> = {
  ariaLabel: string;
  value: T;
  options: readonly OmmSelectOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  triggerClassName?: string;
  menuClassName?: string;
};

/** Converts `[value, label]` tuples into dropdown options. */
export function ommOptionsFromTuples(
  tuples: ReadonlyArray<readonly [string, string]>,
): OmmSelectOption<string>[] {
  return tuples.map(([value, label]) => ({ value, label }));
}

export function OmmSelectDropdown<T extends string>({
  ariaLabel,
  value,
  options,
  onChange,
  label,
  disabled = false,
  name,
  required = false,
  triggerClassName,
  menuClassName,
}: OmmSelectDropdownProps<T>) {
  const selected = options.find((option) => option.value === value);
  const triggerLabel = label ?? selected?.label ?? ariaLabel;

  return (
    <DropdownSelect
      label={triggerLabel}
      ariaLabel={ariaLabel}
      value={value}
      options={options}
      onChange={onChange}
      name={name}
      required={required}
      disabled={disabled}
      triggerClassName={triggerClassName ?? OMM_TRIGGER_CLASS}
      menuClassName={menuClassName}
    />
  );
}

export type OmmFilterDropdownProps = {
  value: string;
  ariaLabel: string;
  allLabel: string;
  allValue: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
  triggerClassName?: string;
};

/** Filter select with a dedicated “all” option (sand highlight + dot when open). */
export function OmmFilterDropdown({
  value,
  ariaLabel,
  allLabel,
  allValue,
  options,
  onChange,
  disabled = false,
  triggerClassName,
}: OmmFilterDropdownProps) {
  const dropdownOptions: OmmSelectOption<string>[] = [
    { value: allValue, label: allLabel },
    ...options.map((option) => ({ value: option.value, label: option.label })),
  ];
  const resolvedValue = value.length > 0 ? value : allValue;

  return (
    <OmmSelectDropdown
      ariaLabel={ariaLabel}
      label={allLabel}
      value={resolvedValue}
      options={dropdownOptions}
      onChange={onChange}
      disabled={disabled}
      triggerClassName={triggerClassName}
    />
  );
}

export type OmmFormDropdownProps = {
  value: string;
  ariaLabel: string;
  placeholderLabel: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  triggerClassName?: string;
};

/** Required pickers without an “all” row (create/edit forms). */
export function OmmFormDropdown({
  value,
  ariaLabel,
  placeholderLabel,
  options,
  onChange,
  disabled = false,
  name,
  required = false,
  triggerClassName,
}: OmmFormDropdownProps) {
  const dropdownOptions: OmmSelectOption<string>[] = options.map((option) => ({
    value: option.value,
    label: option.label,
  }));
  const selected = dropdownOptions.find((option) => option.value === value);

  return (
    <OmmSelectDropdown
      ariaLabel={ariaLabel}
      label={selected?.label ?? placeholderLabel}
      value={value}
      options={dropdownOptions}
      onChange={onChange}
      disabled={disabled || dropdownOptions.length === 0}
      name={name}
      required={required}
      triggerClassName={triggerClassName}
    />
  );
}
