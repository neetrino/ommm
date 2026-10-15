"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  AdminFinancePaymentsFilters,
  financePaymentsFiltersKey,
} from "@/components/admin/admin-finance-payments-filters";
import { parseFinancePaymentsFiltersFromSearch } from "@/components/admin/admin-finance-url";

function ManagerFinancePaymentsFiltersInner() {
  const searchParams = useSearchParams();
  const initialValues = useMemo(
    () => ({
      ...parseFinancePaymentsFiltersFromSearch(Object.fromEntries(searchParams.entries())),
      from: "",
      to: "",
    }),
    [searchParams],
  );
  return (
    <AdminFinancePaymentsFilters
      key={financePaymentsFiltersKey(initialValues)}
      initialValues={initialValues}
      todayOnly
    />
  );
}

/** Search + filters for the Manager "today" payments ledger (no dates, no export). */
export function ManagerFinancePaymentsFilters() {
  return (
    <Suspense fallback={null}>
      <ManagerFinancePaymentsFiltersInner />
    </Suspense>
  );
}
