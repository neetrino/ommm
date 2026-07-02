"use client";

import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import {
  ACCOUNT_PROFILE_FIELD_CELL_CLASS,
  ACCOUNT_PROFILE_FIELD_INPUT_CLASS,
  ACCOUNT_PROFILE_FIELD_LABEL_CLASS,
  ACCOUNT_PROFILE_FIELD_VALUE_CLASS,
  ACCOUNT_PROFILE_FIELD_VALUE_EMPTY_CLASS,
} from "@/components/account/account-profile-info-form.types";
import { PhoneInputField } from "@/components/ui/phone-input-field";
import { ARMENIA_PHONE_DISPLAY_PLACEHOLDER } from "@/lib/phone";

type AccountProfileFieldProps = {
  id: string;
  label: string;
  displayValue: string;
  editing: boolean;
  inputValue: string;
  onChange?: (value: string) => void;
  span?: 1 | 2;
  readOnly?: boolean;
  disabled?: boolean;
  emptyLabel: string;
  multiline?: boolean;
  maxLength?: number;
  usePhoneInput?: boolean;
} & Pick<InputHTMLAttributes<HTMLInputElement>, "type" | "autoComplete" | "inputMode" | "placeholder"> &
  Pick<TextareaHTMLAttributes<HTMLTextAreaElement>, "rows">;

export function AccountProfileField({
  id,
  label,
  displayValue,
  editing,
  inputValue,
  onChange,
  span = 1,
  readOnly = false,
  disabled = false,
  emptyLabel,
  multiline = false,
  maxLength,
  usePhoneInput = false,
  rows = 4,
  type = "text",
  autoComplete,
  inputMode,
  placeholder,
}: AccountProfileFieldProps) {
  const isEmpty = displayValue.trim() === "";
  const spanClass = span === 2 ? "sm:col-span-2" : "";
  const textareaClass = `${ACCOUNT_PROFILE_FIELD_INPUT_CLASS} min-h-[6rem] resize-y`;

  return (
    <div className={`${ACCOUNT_PROFILE_FIELD_CELL_CLASS} ${spanClass}`.trim()}>
      <label className={ACCOUNT_PROFILE_FIELD_LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      {editing && !readOnly ? (
        multiline ? (
          <textarea
            id={id}
            rows={rows}
            maxLength={maxLength}
            placeholder={placeholder}
            className={textareaClass}
            value={inputValue}
            onChange={(event) => onChange?.(event.target.value)}
            disabled={disabled}
          />
        ) : usePhoneInput ? (
          <PhoneInputField
            id={id}
            className={ACCOUNT_PROFILE_FIELD_INPUT_CLASS}
            value={inputValue}
            onValueChange={(value) => onChange?.(value)}
            disabled={disabled}
            placeholder={placeholder ?? ARMENIA_PHONE_DISPLAY_PLACEHOLDER}
          />
        ) : (
          <input
            id={id}
            type={type}
            autoComplete={autoComplete}
            inputMode={inputMode}
            placeholder={placeholder}
            className={ACCOUNT_PROFILE_FIELD_INPUT_CLASS}
            value={inputValue}
            onChange={(event) => onChange?.(event.target.value)}
            disabled={disabled}
          />
        )
      ) : (
        <p
          className={
            multiline && !isEmpty
              ? `${ACCOUNT_PROFILE_FIELD_VALUE_CLASS} whitespace-pre-wrap`
              : isEmpty
                ? ACCOUNT_PROFILE_FIELD_VALUE_EMPTY_CLASS
                : ACCOUNT_PROFILE_FIELD_VALUE_CLASS
          }
        >
          {isEmpty ? emptyLabel : displayValue}
        </p>
      )}
    </div>
  );
}
