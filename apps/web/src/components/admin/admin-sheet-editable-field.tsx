"use client";

import type { ReactNode } from "react";

/** Shared form section wrapper for admin detail sheet tab panels. */
export const ADMIN_SHEET_FORM_SECTION_CLASS =
  "rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5";

type AdminSheetEditableFieldProps = {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

type AdminSheetReadOnlyFieldProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
};

/** Input class helper — error border for validated sheet fields. */
export function adminSheetFieldInputClass(invalid = false, extra = ""): string {
  const classes = ["ommm-input", invalid ? "border-red-300" : "", extra].filter(Boolean);
  return classes.join(" ");
}

/**
 * Label + control + validation message wrapper for inline edit fields in admin detail sheets.
 */
export function AdminSheetEditableField({
  label,
  error,
  hint,
  required = false,
  className = "",
  children,
}: AdminSheetEditableFieldProps) {
  const hasError = error !== undefined && error.length > 0;

  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="ommm-label text-xs uppercase tracking-wide">
        {label}
        {required ? (
          <span className="text-red-600" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </span>
      {children}
      {hasError ? (
        <p className="text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {!hasError && hint ? <p className="text-[11px] text-sage-500">{hint}</p> : null}
    </label>
  );
}

/** Read-only value row (slug preview, computed fields). */
export function AdminSheetReadOnlyField({
  label,
  value,
  hint,
  className = "",
}: AdminSheetReadOnlyFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <span className="ommm-label text-xs uppercase tracking-wide">{label}</span>
      <p className="ommm-input bg-white/40 text-sage-600" aria-live="polite">
        {value}
      </p>
      {hint ? <p className="text-[11px] text-sage-500">{hint}</p> : null}
    </div>
  );
}
