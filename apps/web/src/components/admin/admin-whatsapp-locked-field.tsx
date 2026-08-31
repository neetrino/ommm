"use client";

import { useEffect, useRef } from "react";
import {
  CancelGlyph,
  PencilGlyph,
} from "@/components/ui/admin-action-glyphs";
import { adminSheetFieldInputClass } from "@/components/admin/admin-sheet-editable-field";

type AdminWhatsappLockedFieldProps = {
  label: string;
  displayValue: string;
  editValue: string;
  editing: boolean;
  hint?: string;
  inputType?: "text" | "password";
  inputMode?: "text" | "url";
  placeholder?: string;
  editAriaLabel: string;
  cancelAriaLabel: string;
  onEdit: () => void;
  onCancel: () => void;
  onChange: (value: string) => void;
};

const LOCKED_VALUE_CLASS =
  "ommm-input flex min-h-[2.75rem] items-center pr-12 text-sm font-medium text-sage-800";
const FIELD_ACTION_CLASS =
  "absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-sage-600 transition-[opacity,background-color,color] hover:bg-white hover:text-sage-900 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500";

export function AdminWhatsappLockedField({
  label,
  displayValue,
  editValue,
  editing,
  hint,
  inputType = "text",
  inputMode = "text",
  placeholder,
  editAriaLabel,
  cancelAriaLabel,
  onEdit,
  onCancel,
  onChange,
}: AdminWhatsappLockedFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="ommm-label text-xs uppercase tracking-wide">{label}</span>
      <div className="group relative">
        {editing ? (
          <input
            ref={inputRef}
            className={`${adminSheetFieldInputClass()} pr-12`}
            type={inputType}
            inputMode={inputMode}
            value={editValue}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        ) : (
          <p className={LOCKED_VALUE_CLASS}>{displayValue}</p>
        )}
        {editing ? (
          <button
            type="button"
            className={`${FIELD_ACTION_CLASS} opacity-100`}
            aria-label={cancelAriaLabel}
            onClick={onCancel}
          >
            <CancelGlyph className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            className={`${FIELD_ACTION_CLASS} opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100`}
            aria-label={editAriaLabel}
            onClick={onEdit}
          >
            <PencilGlyph className="h-4 w-4" />
          </button>
        )}
      </div>
      {hint ? <p className="text-[11px] text-sage-500">{hint}</p> : null}
    </div>
  );
}
