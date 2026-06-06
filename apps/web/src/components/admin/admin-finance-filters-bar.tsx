"use client";

import type { ReactNode } from "react";

type AdminFinanceFiltersBarProps = {
  search: ReactNode;
  trailing?: ReactNode;
};

/** Search + trailing row inside the finance unified header (single-line layout). */
export function AdminFinanceFiltersBar({ search, trailing }: AdminFinanceFiltersBarProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-2">
      <div className="flex min-w-0 flex-1 items-center">{search}</div>
      {trailing ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{trailing}</div>
      ) : null}
    </div>
  );
}
