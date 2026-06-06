"use client";

import type { ReactNode } from "react";

type AdminFinanceFiltersBarProps = {
  search: ReactNode;
  trailing?: ReactNode;
};

/** Compact filter row below finance module tabs (NBOS module hero search row). */
export function AdminFinanceFiltersBar({ search, trailing }: AdminFinanceFiltersBarProps) {
  return (
    <div className="mb-6 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
      <div className="flex min-w-0 flex-1 items-center">{search}</div>
      {trailing ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{trailing}</div>
      ) : null}
    </div>
  );
}
