"use client";

import type { InputHTMLAttributes } from "react";
import { PhoneInputField } from "@/components/ui/phone-input-field";
import { extractPhoneDigits } from "@/lib/phone";

type PhoneInputWithSameToggleProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "inputMode" | "value" | "defaultValue" | "onChange"
> & {
  phone: string;
  value: string;
  sameAsPhone: boolean;
  sameAsPhoneLabel: string;
  onValueChange: (value: string) => void;
  onSameAsPhoneChange: (same: boolean) => void;
};

const FIELD_SHELL_CLASS = "relative";
const CHECKBOX_CLASS =
  "absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded border-sand-500/50 accent-sand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/40";

export function arePhonesTheSame(left: string, right: string): boolean {
  const a = extractPhoneDigits(left);
  const b = extractPhoneDigits(right);
  return a.length > 0 && a === b;
}

/** Phone input with a same-as-phone checkbox inside the field. */
export function PhoneInputWithSameToggle({
  phone,
  value,
  sameAsPhone,
  sameAsPhoneLabel,
  onValueChange,
  onSameAsPhoneChange,
  className,
  disabled,
  ...rest
}: PhoneInputWithSameToggleProps) {
  return (
    <div className={FIELD_SHELL_CLASS}>
      <PhoneInputField
        {...rest}
        className={`${className ?? ""} pr-12`.trim()}
        value={sameAsPhone ? phone : value}
        onValueChange={onValueChange}
        disabled={disabled === true || sameAsPhone}
      />
      <input
        type="checkbox"
        checked={sameAsPhone}
        onChange={(event) => onSameAsPhoneChange(event.target.checked)}
        className={CHECKBOX_CLASS}
        aria-label={sameAsPhoneLabel}
        disabled={disabled}
      />
    </div>
  );
}
