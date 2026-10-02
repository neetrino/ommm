"use client";

import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmSelectDropdown, type OmmSelectOption } from "@/components/ui/omm-select-dropdown";

const OPTION_LABEL_CLASS = "text-sm font-medium text-sage-700";
const PLAIN_LABEL_CLASS = "ommm-label text-xs uppercase tracking-wide";
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
  placeholder,
  plain = false,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  type?: "text" | "email" | "number";
  inputMode?: "numeric";
  placeholder?: string;
  /** Uppercase label and the shared input, matching the admin gift form. */
  plain?: boolean;
}) {
  return (
    <label className={`flex min-w-0 flex-col ${plain ? "gap-1" : "gap-2"}`}>
      <span className={plain ? PLAIN_LABEL_CLASS : OPTION_LABEL_CLASS}>{label}</span>
      <input
        className={
          plain
            ? `ommm-input${type === "number" ? " [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" : ""}`
            : `ommm-input ${OPTION_CONTROL_CLASS}`
        }
        type={type}
        inputMode={inputMode}
        min={type === "number" ? 1 : undefined}
        step={type === "number" ? 1 : undefined}
        value={value}
        placeholder={placeholder}
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
  plain = false,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  /** Uppercase label and the shared input, matching the admin gift form. */
  plain?: boolean;
}) {
  return (
    <label className={`flex min-w-0 flex-col ${plain ? "gap-1" : "gap-2"}`}>
      <span className={plain ? PLAIN_LABEL_CLASS : OPTION_LABEL_CLASS}>{label}</span>
      <DatePickerInput
        name="customGiftDeliverAt"
        ariaLabel={label}
        value={value}
        disabled={disabled}
        disablePastDates
        containerClassName={plain ? undefined : OPTION_CONTROL_CLASS}
        onChange={onChange}
      />
    </label>
  );
}
