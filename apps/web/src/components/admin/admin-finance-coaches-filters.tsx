"use client";

import { useEffect, useMemo, useRef, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminFinanceFiltersBar } from "@/components/admin/admin-finance-filters-bar";
import {
  adminFinanceCoachesIntegratedFilterValues,
  buildAdminFinanceCoachesFilterFields,
  parseCoachesIntegratedFilterChange,
} from "@/components/admin/admin-finance-coaches-filter-fields";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import type { CoachFinanceFilters } from "@/components/admin/admin-finance-types";
import {
  buildFinanceCoachesFiltersQuery,
  FINANCE_COACH_PAGE_KEYS,
} from "@/components/admin/admin-finance-url";
import { usePropSyncedState } from "@/hooks/use-prop-synced-state";
import { resetListPageQuery } from "@/lib/list-pagination";

const FILTER_DEBOUNCE_MS = 300;

type AdminFinanceCoachesFiltersProps = {
  initialValues: CoachFinanceFilters & { q: string };
};

type CoachesFilterState = CoachFinanceFilters & { q: string };

export function AdminFinanceCoachesFilters({ initialValues }: AdminFinanceCoachesFiltersProps) {
  const tFilters = useTranslations("adminPages.finance.coachTab");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMounted = useRef(false);
  const [, startTransition] = useTransition();
  const [values, setValues] = usePropSyncedState(initialValues);

  const filterFields = useMemo(
    () =>
      buildAdminFinanceCoachesFilterFields({
        labels: {
          monthLabel: tFilters("monthLabel"),
          payoutStatusLabel: tFilters("payoutStatusLabel"),
          filterAll: tFilters("filterAll"),
          statusPaid: tFilters("statusPaid"),
          statusPending: tFilters("statusPending"),
          statusNone: tFilters("statusNone"),
          sortLabel: tFilters("sortLabel"),
          sortHighestSalary: tFilters("sortHighestSalary"),
          sortOldest: tFilters("sortOldest"),
        },
      }),
    [tFilters],
  );

  const integratedFilterValues = useMemo(
    () =>
      adminFinanceCoachesIntegratedFilterValues({
        month: values.month,
        payoutStatus: values.payoutStatus,
        order: values.order,
      }),
    [values],
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }

    const handle = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      resetListPageQuery(params, FINANCE_COACH_PAGE_KEYS);
      const query = buildFinanceCoachesFiltersQuery(values, params);
      if (query === searchParams.toString()) {
        return;
      }
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    }, FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [pathname, router, searchParams, values]);

  function updateValues(next: CoachesFilterState): void {
    setValues(next);
  }

  function resetFilters(): void {
    setValues({
      q: "",
      search: "",
      month: new Date().toISOString().slice(0, 7),
      payoutStatus: "",
      order: "newest",
      quick: "",
    });
  }

  function handleIntegratedFilterChange(key: string, value: string): void {
    updateValues({ ...parseCoachesIntegratedFilterChange(key, value, values), q: values.q });
  }

  return (
    <AdminFinanceFiltersBar
      search={
        <ListPageSearchFilters
          search={values.q}
          onSearchChange={(value) => updateValues({ ...values, q: value, search: value })}
          searchPlaceholder={tFilters("searchPlaceholder")}
          fields={filterFields}
          filterValues={integratedFilterValues}
          onFilterChange={handleIntegratedFilterChange}
          onClearAll={resetFilters}
          resetLabel={tFilters("clearFilters")}
        />
      }
    />
  );
}
