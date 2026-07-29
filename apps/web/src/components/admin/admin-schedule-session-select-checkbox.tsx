"use client";

const CHECKBOX_CLASS = [
  "h-4 w-4 shrink-0 cursor-pointer rounded border border-sage-300 bg-white",
  "text-mint-600 accent-mint-600",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-400/50",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

type AdminScheduleSessionSelectCheckboxProps = {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  ariaLabel: string;
  onChange: (checked: boolean) => void;
};

/** Row / header checkbox for schedule session multi-select. */
export function AdminScheduleSessionSelectCheckbox({
  checked,
  indeterminate = false,
  disabled = false,
  ariaLabel,
  onChange,
}: AdminScheduleSessionSelectCheckboxProps) {
  return (
    <input
      type="checkbox"
      className={CHECKBOX_CLASS}
      checked={checked}
      disabled={disabled}
      aria-label={ariaLabel}
      ref={(node) => {
        if (node) {
          node.indeterminate = indeterminate && !checked;
        }
      }}
      onChange={(event) => {
        onChange(event.target.checked);
      }}
      onClick={(event) => {
        event.stopPropagation();
      }}
    />
  );
}
