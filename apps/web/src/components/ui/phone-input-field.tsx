"use client";

import type { InputHTMLAttributes } from "react";
import { useRef } from "react";
import { applyPhoneInputChange } from "@/lib/phone-input";
import {
  ARMENIA_PHONE_DISPLAY_PLACEHOLDER,
  formatPhoneDisplay,
  PHONE_INPUT_DEFAULT_PREFIX,
} from "@/lib/phone";

type PhoneInputFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "inputMode" | "value" | "defaultValue" | "onChange"
> & {
  value: string;
  onValueChange: (value: string) => void;
};

/** Controlled phone input with live formatting after the user enters +374 manually. */
export function PhoneInputField({
  value,
  onValueChange,
  placeholder = ARMENIA_PHONE_DISPLAY_PLACEHOLDER,
  maxLength,
  onFocus,
  onBlur,
  ...rest
}: PhoneInputFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const formatted = applyPhoneInputChange(input, input.value);
    onValueChange(formatted);
  }

  function handleFocus(event: React.FocusEvent<HTMLInputElement>) {
    if (value.trim().length === 0) {
      onValueChange(PHONE_INPUT_DEFAULT_PREFIX);
    }
    onFocus?.(event);
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    if (value === PHONE_INPUT_DEFAULT_PREFIX) {
      onValueChange("");
    }
    onBlur?.(event);
  }

  return (
    <input
      {...rest}
      ref={inputRef}
      type="tel"
      inputMode="tel"
      autoComplete={rest.autoComplete ?? "tel"}
      placeholder={placeholder}
      maxLength={maxLength ?? 16}
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
}

/** Read-only formatted phone text for tables, drawers, and detail views. */
export function FormattedPhoneText({
  value,
  fallback = "—",
  className,
}: {
  value: string | null | undefined;
  fallback?: string;
  className?: string;
}) {
  const trimmed = value?.trim() ?? "";
  if (trimmed.length === 0) {
    return <span className={className}>{fallback}</span>;
  }
  return <span className={className}>{formatPhoneDisplay(trimmed)}</span>;
}
