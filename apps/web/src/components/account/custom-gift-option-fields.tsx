"use client";

import { OmmSelectDropdown, type OmmSelectOption } from "@/components/ui/omm-select-dropdown";

const OPTION_LABEL_CLASS = "text-sm font-medium text-sage-700";

export function GiftOptionSelect<T extends string>({
  label,
  value,
  options,
  disabled,
  onChange,
  className = "",
}: {
  label: string;
  value: T;
  options: readonly OmmSelectOption<T>[];
  disabled: boolean;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <label className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <span className={OPTION_LABEL_CLASS}>{label}</span>
      <OmmSelectDropdown
        ariaLabel={label}
        value={value}
        options={options}
        disabled={disabled}
        onChange={onChange}
      />
    </label>
  );
}
