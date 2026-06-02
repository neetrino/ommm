import type { ReactNode } from "react";

type AdminFilterResetButtonProps = {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
};

export function AdminFilterResetIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

/** Matches Schedule admin filter reset — sage pill with cream label. */
export function AdminFilterResetButton({
  onClick,
  children,
  disabled = false,
  className = "",
}: AdminFilterResetButtonProps) {
  const merged = ["ommm-schedule-accent-button gap-1.5", className].filter(Boolean).join(" ");
  return (
    <button type="button" className={merged} onClick={onClick} disabled={disabled}>
      <AdminFilterResetIcon className="h-3.5 w-3.5 shrink-0" />
      {children}
    </button>
  );
}
