"use client";

import { TrashGlyph } from "@/components/ui/admin-action-glyphs";

type DeleteActionButtonProps = {
  ariaLabel: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  label?: string;
  className?: string;
  iconClassName?: string;
};

const DELETE_ACTION_BUTTON_BASE_CLASSES =
  "inline-flex items-center justify-center rounded-full border border-red-200/80 bg-red-50/90 text-red-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-red-100 hover:text-red-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50";

export function DeleteActionButton({
  ariaLabel,
  onClick,
  disabled = false,
  title,
  label,
  className,
  iconClassName,
}: DeleteActionButtonProps) {
  const isIconOnly = label === undefined || label.trim().length === 0;
  const sizeClasses = isIconOnly ? "h-8 w-8" : "h-8 gap-1.5 px-3 text-xs font-medium";
  const mergedClassName = [DELETE_ACTION_BUTTON_BASE_CLASSES, sizeClasses, className]
    .filter((value) => value !== undefined && value.length > 0)
    .join(" ");
  const mergedIconClassName =
    iconClassName === undefined || iconClassName.length === 0 ? "h-4 w-4 shrink-0" : iconClassName;

  return (
    <button
      type="button"
      className={mergedClassName}
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
      onClick={onClick}
      disabled={disabled}
    >
      <TrashGlyph className={mergedIconClassName} />
      {isIconOnly ? null : <span>{label}</span>}
    </button>
  );
}
