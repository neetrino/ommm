"use client";

import type { ReactNode } from "react";

type AdminFinanceFiltersBarProps = {
  search: ReactNode;
  trailing?: ReactNode;
};

/** Search + trailing row inside the finance unified header (single-line layout). */
export function AdminFinanceFiltersBar({ search, trailing }: AdminFinanceFiltersBarProps) {
  return (
    <div className="flex min-w-0 w-max max-w-none flex-nowrap items-center gap-2 sm:w-full sm:max-w-full">
      <div className="flex min-w-0 shrink-0 items-center">{search}</div>
      {trailing ? (
        <div className="flex shrink-0 flex-nowrap items-center gap-2">{trailing}</div>
      ) : null}
    </div>
  );
}
