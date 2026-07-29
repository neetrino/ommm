"use client";

import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";

export type OmmSelectOption<T extends string = string> = DropdownOption<T>;

export type OmmSelectDropdownProps<T extends string> = {
  ariaLabel: string;
  value: T;
  options: readonly OmmSelectOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  wrapLabel?: boolean;
  wrapMenuLabel?: boolean;
  openOnHover?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  noResultsLabel?: string;
  menuMinWidth?: number;
  toggleDeselectValue?: T;
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
  className,
  triggerClassName,
  menuClassName,
  wrapLabel = false,
  wrapMenuLabel,
  openOnHover = false,
  searchable = false,
  searchPlaceholder = "",
  noResultsLabel = "",
  menuMinWidth,
  toggleDeselectValue,
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
      className={className}
      triggerClassName={triggerClassName}
      menuClassName={menuClassName}
      wrapLabel={wrapLabel}
      wrapMenuLabel={wrapMenuLabel}
      openOnHover={openOnHover}
      searchable={searchable}
      searchPlaceholder={searchPlaceholder}
      noResultsLabel={noResultsLabel}
      menuMinWidth={menuMinWidth}
      toggleDeselectValue={toggleDeselectValue}
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
  className?: string;
  triggerClassName?: string;
  wrapLabel?: boolean;
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
  className,
  triggerClassName,
  wrapLabel = false,
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
      className={className}
      triggerClassName={triggerClassName}
      wrapLabel={wrapLabel}
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
