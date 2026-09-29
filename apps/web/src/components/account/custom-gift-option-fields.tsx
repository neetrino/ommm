"use client";

import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmSelectDropdown, type OmmSelectOption } from "@/components/ui/omm-select-dropdown";

const OPTION_LABEL_CLASS = "text-sm font-medium text-sage-700";
const OPTION_CONTROL_CLASS = "!h-14 !rounded-2xl border-sand-500/25 bg-white px-4 text-base";

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
        triggerClassName={OPTION_CONTROL_CLASS}
        onChange={onChange}
      />
    </label>
  );
}

export function GiftOptionText({
  label,
  value,
  disabled,
  onChange,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  type?: "text" | "email";
  inputMode?: "numeric";
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className={OPTION_LABEL_CLASS}>{label}</span>
      <input
        className={`ommm-input ${OPTION_CONTROL_CLASS}`}
        type={type}
        inputMode={inputMode}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function GiftOptionDate({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className={OPTION_LABEL_CLASS}>{label}</span>
      <DatePickerInput
        name="customGiftDeliverAt"
        ariaLabel={label}
        value={value}
        disabled={disabled}
        disablePastDates
        containerClassName={OPTION_CONTROL_CLASS}
        onChange={onChange}
      />
    </label>
  );
}
