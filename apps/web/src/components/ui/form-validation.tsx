import type { ReactNode } from "react";

/** Red outline for invalid form controls — site-wide. */
export const FORM_INVALID_FIELD_CLASS =
  "border-red-400 !shadow-none ring-2 ring-red-400/15";

type FormFieldErrorProps = {
  message?: string | null;
  /** When false, nothing is rendered (keeps call sites simple). */
  show?: boolean;
  className?: string;
};

/**
 * Inline validation text under a field.
 * Use next to the control that failed validation.
 */
export function FormFieldError({
  message,
  show = true,
  className = "",
}: FormFieldErrorProps) {
  if (!show || message === undefined || message === null || message.trim().length === 0) {
    return null;
  }
  return (
    <p
      className={`text-xs font-medium leading-snug text-red-700 ${className}`.trim()}
      role="alert"
    >
      {message}
    </p>
  );
}

type FormFieldErrorForProps<TField extends string> = {
  field: TField;
  errorField: TField | null;
  message: string | null;
};

/** Renders {@link FormFieldError} only when `errorField` matches this field. */
export function FormFieldErrorFor<TField extends string>({
  field,
  errorField,
  message,
}: FormFieldErrorForProps<TField>) {
  return (
    <FormFieldError show={errorField === field} message={message} />
  );
}

/** Builds `ommm-input` (+ optional extras) with invalid ring when needed. */
export function formFieldInputClass(invalid = false, extra = ""): string {
  return ["ommm-input", invalid ? FORM_INVALID_FIELD_CLASS : "", extra]
    .filter(Boolean)
    .join(" ");
}

/** Same as {@link formFieldInputClass}, keyed by active error field name. */
export function formFieldInputClassFor<TField extends string>(
  field: TField,
  errorField: TField | null,
  extra = "",
): string {
  return formFieldInputClass(errorField === field, extra);
}

type FormErrorBannerProps = {
  message: string | null | undefined;
  className?: string;
  children?: ReactNode;
  /**
   * `strip` — full-width bar above sticky actions (modals).
   * `inline` — rounded card for page forms / auth.
   */
  variant?: "strip" | "inline";
};

/**
 * Form error surface — sand/red Ommm treatment with leading !.
 * Place above form actions (`strip`) or under the form (`inline`).
 */
export function FormErrorBanner({
  message,
  className = "",
  children,
  variant = "strip",
}: FormErrorBannerProps) {
  const hasMessage =
    message !== undefined && message !== null && message.trim().length > 0;
  if (!hasMessage && children === undefined) {
    return null;
  }

  const shellClass =
    variant === "inline"
      ? "rounded-2xl border border-red-200/70 bg-red-50/90 px-4 py-3"
      : "shrink-0 border-t border-red-200/70 bg-red-50/90 px-5 py-3 sm:px-7";

  return (
    <div className={`${shellClass} ${className}`.trim()}>
      <div className="flex items-start gap-2.5 text-sm text-red-900" role="alert">
        <span
          className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600/15 text-[11px] font-semibold text-red-800"
          aria-hidden
        >
          !
        </span>
        <div className="min-w-0 leading-snug">
          {hasMessage ? <p>{message}</p> : null}
          {children}
        </div>
      </div>
    </div>
  );
}

const FOCUS_AFTER_PAINT_MS = 50;

/**
 * Scrolls a named form control (or `[data-form-field="…"]` section) into view and focuses it.
 */
export function focusFormField(
  form: HTMLFormElement,
  field: string,
): void {
  window.setTimeout(() => {
    const section = form.querySelector(`[data-form-field="${field}"]`);
    let target: HTMLElement | null =
      section instanceof HTMLElement ? section : null;

    if (target === null) {
      const named = form.elements.namedItem(field);
      if (named instanceof HTMLElement) {
        target = named;
      } else if (named instanceof RadioNodeList) {
        const first = named.item(0);
        target = first instanceof HTMLElement ? first : null;
      }
    }

    if (target === null) {
      return;
    }
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    if (typeof target.focus === "function") {
      target.focus({ preventScroll: true });
    }
  }, FOCUS_AFTER_PAINT_MS);
}
