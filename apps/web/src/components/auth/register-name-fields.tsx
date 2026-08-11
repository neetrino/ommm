"use client";

import { PSEUDO_FIRST_NAME, PSEUDO_LAST_NAME } from "@/lib/pseudo-form-placeholders";
import { formFieldInputClassFor } from "@/components/ui/form-validation";

export type RegisterNameField = "firstName" | "lastName";

type RegisterNameFieldsProps = {
  firstNameLabel: string;
  lastNameLabel: string;
  maxNameLength: number;
  errorField: RegisterNameField | null;
  errorMessage: string | null;
  onClearFieldError: (field: RegisterNameField) => void;
  /** Runs when the user leaves a name field — used for Latin-script checks on mobile. */
  onValidateField?: (field: RegisterNameField, value: string) => void;
};

/** First / last name inputs with inline Latin-script validation messages under each field. */
export function RegisterNameFields({
  firstNameLabel,
  lastNameLabel,
  maxNameLength,
  errorField,
  errorMessage,
  onClearFieldError,
  onValidateField,
}: RegisterNameFieldsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1.5">
        <span className="ommm-label">{firstNameLabel}</span>
        <input
          name="firstName"
          required
          autoComplete="given-name"
          className={formFieldInputClassFor("firstName", errorField)}
          maxLength={maxNameLength}
          placeholder={PSEUDO_FIRST_NAME}
          aria-invalid={errorField === "firstName"}
          aria-describedby={
            errorField === "firstName" ? "register-first-name-error" : undefined
          }
          onChange={() => {
            if (errorField === "firstName") {
              onClearFieldError("firstName");
            }
          }}
          onBlur={(event) => {
            onValidateField?.("firstName", event.currentTarget.value);
          }}
        />
        {errorField === "firstName" && errorMessage ? (
          <p
            id="register-first-name-error"
            className="rounded-xl border border-red-200/80 bg-red-50 px-3 py-2 text-xs font-medium leading-snug text-red-800"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="ommm-label">{lastNameLabel}</span>
        <input
          name="lastName"
          required
          autoComplete="family-name"
          className={formFieldInputClassFor("lastName", errorField)}
          maxLength={maxNameLength}
          placeholder={PSEUDO_LAST_NAME}
          aria-invalid={errorField === "lastName"}
          aria-describedby={
            errorField === "lastName" ? "register-last-name-error" : undefined
          }
          onChange={() => {
            if (errorField === "lastName") {
              onClearFieldError("lastName");
            }
          }}
          onBlur={(event) => {
            onValidateField?.("lastName", event.currentTarget.value);
          }}
        />
        {errorField === "lastName" && errorMessage ? (
          <p
            id="register-last-name-error"
            className="rounded-xl border border-red-200/80 bg-red-50 px-3 py-2 text-xs font-medium leading-snug text-red-800"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}
      </label>
    </div>
  );
}
