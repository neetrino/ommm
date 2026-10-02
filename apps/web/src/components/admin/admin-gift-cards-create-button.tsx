"use client";

const CREATE_BUTTON_CLASS = [
  "inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-full sm:w-auto",
  "bg-[var(--ommm-admin-olive)] pl-1.5 pr-5 text-sm font-semibold text-[var(--ommm-admin-cream)]",
  "shadow-[0_12px_28px_-16px_rgba(45,40,35,0.55)]",
  "transition-[transform,background-color,box-shadow] duration-200",
  "hover:bg-[#867f6c] hover:shadow-[0_16px_32px_-16px_rgba(45,40,35,0.5)]",
  "active:scale-[0.985]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ommm-admin-olive)]/40",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
].join(" ");

export function AdminGiftCardsCreateButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="flex justify-center">
      <button type="button" className={CREATE_BUTTON_CLASS} onClick={onClick}>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <PlusGlyph />
        </span>
        {label}
      </button>
    </div>
  );
}

function PlusGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
