import type { ReactNode } from "react";
import { AdminFilterResetButton } from "@/components/ui/admin-filter-reset-button";

type AdminFilterResetBarProps = {
  onReset: () => void;
  label: string;
  meta?: ReactNode;
  leading?: ReactNode;
};

/** Filter footer row — optional leading controls left, meta + reset aligned to the right. */
export function AdminFilterResetBar({
  onReset,
  label,
  meta,
  leading,
}: AdminFilterResetBarProps) {
  return (
    <div className="flex w-full flex-wrap items-center gap-2 sm:gap-3">
      {leading ? <div className="flex flex-wrap items-center gap-2">{leading}</div> : null}
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        {meta}
        <AdminFilterResetButton onClick={onReset}>{label}</AdminFilterResetButton>
      </div>
    </div>
  );
}
