"use client";

import type { ReactNode } from "react";
import {
  FormFieldError,
  FORM_INVALID_FIELD_CLASS,
  formFieldInputClass,
} from "@/components/ui/form-validation";
import {
  DETAILS_CARD_CLASS,
  DETAILS_FIELD_BOX_CLASS,
  DetailsFloatingLabel,
} from "@/components/shared/details/details-card";

/** Shared form section wrapper for admin detail sheet tab panels. */
export const ADMIN_SHEET_FORM_SECTION_CLASS =
  "rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5";

type AdminSheetEditableFieldProps = {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  /** Optional leading icon beside the label. */
  icon?: ReactNode;
  /** Tighter label/control spacing for dense detail sheets. */
  compact?: boolean;
  className?: string;
  children: ReactNode;
};

type AdminSheetReadOnlyFieldProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  /** Optional leading icon beside the label. */
  icon?: ReactNode;
  /** Kept for call-site compatibility; read-only fields share one size now. */
  compact?: boolean;
  /** Wraps long text (bio, notes) instead of truncating to one line. */
  multiline?: boolean;
  className?: string;
};

const FIELD_LABEL_CLASS = "ommm-label text-xs uppercase tracking-wide";
const FIELD_LABEL_COMPACT_CLASS = "ommm-label text-[11px] uppercase tracking-wide";
const READONLY_VALUE_CLASS = "min-w-0 flex-1 truncate text-sm font-medium text-sage-900";
const READONLY_VALUE_MULTILINE_CLASS =
  "min-w-0 flex-1 whitespace-pre-wrap break-words text-sm font-medium text-sage-900";

/** Solid white profile card whose inputs get a visible border (edit mode). */
export const ADMIN_SHEET_PROFILE_CARD_CLASS = `${DETAILS_CARD_CLASS} [&_.ommm-input]:border-sage-500/15`;

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
export const ADMIN_INVALID_FIELD_CLASS = FORM_INVALID_FIELD_CLASS;

/** Input class helper — error border for validated sheet fields. */
export function adminSheetFieldInputClass(invalid = false, extra = ""): string {
  return formFieldInputClass(invalid, extra);
}

/**
 * Label + control + validation message wrapper for inline edit fields in admin detail sheets.
 */
export function AdminSheetEditableField({
  label,
  error,
  hint,
  required = false,
  icon,
  compact = false,
  className = "",
  children,
}: AdminSheetEditableFieldProps) {
  const hasError = error !== undefined && error.length > 0;

  return (
    <label className={`flex flex-col ${compact ? "gap-1" : "gap-1.5"} ${className}`}>
      <span
        className={`inline-flex items-center gap-1.5 ${compact ? FIELD_LABEL_COMPACT_CLASS : FIELD_LABEL_CLASS}`}
      >
        {icon ? <span className="shrink-0 text-sage-500">{icon}</span> : null}
        {label}
        {required ? (
          <span className="text-red-600" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </span>
      {children}
      <FormFieldError message={error} show={hasError} />
      {!hasError && hint ? <p className="text-[11px] text-sage-500">{hint}</p> : null}
    </label>
  );
}

/**
 * Read-only value in a bordered box with the label on its top border.
 * Place inside a solid white card ({@link DETAILS_CARD_CLASS}) so the label masks the border.
 */
export function AdminSheetReadOnlyField({
  label,
  value,
  hint,
  icon,
  multiline = false,
  className = "",
}: AdminSheetReadOnlyFieldProps) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`.trim()}>
      <DetailsFloatingLabel label={label}>
        <div className={`${DETAILS_FIELD_BOX_CLASS} gap-2.5 ${multiline ? "items-start" : ""}`}>
          {icon ? <span className="shrink-0 text-sage-500">{icon}</span> : null}
          <p
            className={multiline ? READONLY_VALUE_MULTILINE_CLASS : READONLY_VALUE_CLASS}
            aria-live="polite"
            title={typeof value === "string" ? value : undefined}
          >
            {value}
          </p>
        </div>
      </DetailsFloatingLabel>
      {hint ? <p className="px-1 text-[11px] text-sage-500">{hint}</p> : null}
    </div>
  );
}
