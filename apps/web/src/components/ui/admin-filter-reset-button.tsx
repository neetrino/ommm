import type { ReactNode } from "react";

type AdminFilterResetButtonProps = {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
};

/** Matches Schedule admin filter reset — sage pill with cream label. */
export function AdminFilterResetButton({
  onClick,
  children,
  disabled = false,
  className = "",
}: AdminFilterResetButtonProps) {
  return (
    <button
      type="button"
      className={className ? `ommm-schedule-accent-button ${className}` : "ommm-schedule-accent-button"}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
