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
  /** Tighter label/control spacing for dense detail sheets. */
  compact?: boolean;
  className?: string;
  children: ReactNode;
};

type AdminSheetReadOnlyFieldProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  /** Tighter label/value spacing for dense detail sheets. */
  compact?: boolean;
  className?: string;
};

const FIELD_LABEL_CLASS = "ommm-label text-xs uppercase tracking-wide";
const FIELD_LABEL_COMPACT_CLASS = "ommm-label text-[11px] uppercase tracking-wide";
/** Plain text — no input chrome in resting/read-only state. */
const READONLY_VALUE_CLASS = "min-h-0 break-words text-sm font-medium text-sage-800";
const READONLY_VALUE_COMPACT_CLASS =
  "min-h-0 break-words text-sm font-medium leading-snug text-sage-800";

/** Required-field asterisk for admin forms. */
export function AdminRequiredMark() {
  return (
    <span className="text-red-600" aria-hidden>
      {" "}
      *
    </span>
  );
}

/** Thin red outline for invalid admin form controls. */
export const ADMIN_INVALID_FIELD_CLASS = "border-red-400 !shadow-none ring-2 ring-red-400/15";

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
  compact = false,
  className = "",
  children,
}: AdminSheetEditableFieldProps) {
  const hasError = error !== undefined && error.length > 0;

  return (
    <label className={`flex flex-col ${compact ? "gap-1" : "gap-1.5"} ${className}`}>
      <span className={compact ? FIELD_LABEL_COMPACT_CLASS : FIELD_LABEL_CLASS}>
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
  compact = false,
  className = "",
}: AdminSheetReadOnlyFieldProps) {
  return (
    <div className={`flex flex-col ${compact ? "gap-1" : "gap-1.5"} ${className}`}>
      <span className={compact ? FIELD_LABEL_COMPACT_CLASS : FIELD_LABEL_CLASS}>{label}</span>
      <p
        className={compact ? READONLY_VALUE_COMPACT_CLASS : READONLY_VALUE_CLASS}
        aria-live="polite"
      >
        {value}
      </p>
      {hint ? <p className="text-[11px] text-sage-500">{hint}</p> : null}
    </div>
  );
}
