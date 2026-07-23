"use client";

type EditActionButtonProps = {
  ariaLabel: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  label?: string;
  className?: string;
  iconClassName?: string;
};

function PencilGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

const EDIT_ACTION_BUTTON_BASE_CLASSES =
  "inline-flex items-center justify-center rounded-full border border-white/60 bg-white/70 text-sage-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-sage-900 active:scale-95 active:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50";

export function EditActionButton({
  ariaLabel,
  onClick,
  disabled = false,
  title,
  label,
  className,
  iconClassName,
}: EditActionButtonProps) {
  const isIconOnly = label === undefined || label.trim().length === 0;
  const sizeClasses = isIconOnly ? "h-8 w-8" : "h-8 gap-1.5 px-3 text-xs font-medium";
  const mergedClassName = [EDIT_ACTION_BUTTON_BASE_CLASSES, sizeClasses, className]
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
      <PencilGlyph className={mergedIconClassName} />
      {isIconOnly ? null : <span>{label}</span>}
    </button>
  );
}
