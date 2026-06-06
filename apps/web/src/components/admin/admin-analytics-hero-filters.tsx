"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  adminAnalyticsIntegratedFilterValues,
  buildAdminAnalyticsFilterFields,
} from "@/components/admin/admin-analytics-filter-fields";
import type { AnalyticsSectionId } from "@/components/admin/admin-analytics-module";
import type { AnalyticsFilterOptions } from "@/components/admin/admin-analytics-server-helpers";
import type { AnalyticsFilterValues } from "@/components/admin/admin-analytics-types";
import {
  applyAnalyticsIntegratedFilterChange,
  buildAnalyticsFiltersQuery,
  defaultAnalyticsFilterValues,
} from "@/components/admin/admin-analytics-url";
import { AdminFinanceFiltersBar } from "@/components/admin/admin-finance-filters-bar";
import { AdminIntegratedSearchFilters } from "@/components/admin/admin-integrated-search-filters";

const FILTER_DEBOUNCE_MS = 300;

type AdminAnalyticsHeroFiltersProps = {
  section: AnalyticsSectionId;
  filterOptions: AnalyticsFilterOptions;
  initialValues: AnalyticsFilterValues;
  trailing?: ReactNode;
};

export function AdminAnalyticsHeroFilters({
  section,
  filterOptions,
  initialValues,
  trailing,
}: AdminAnalyticsHeroFiltersProps) {
  const tFilters = useTranslations("adminPages.analytics.filters");
  const tSearchTools = useTranslations("adminPages.searchTools");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMounted = useRef(false);
  const valuesFromUrlRef = useRef(false);
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(initialValues);

  const filterFields = useMemo(
    () =>
      buildAdminAnalyticsFilterFields({
        section,
        filterOptions,
        labels: {
          rangeLabel: tFilters("rangeLabel"),
          range7: tFilters("range7"),
          range30: tFilters("range30"),
          range90: tFilters("range90"),
          coachLabel: tFilters("coachLabel"),
          coachAll: tFilters("coachAll"),
          classTypeLabel: tFilters("classTypeLabel"),
          classTypeAll: tFilters("classTypeAll"),
          bookingStatusLabel: tFilters("bookingStatusLabel"),
          bookingStatusAll: tFilters("bookingStatusAll"),
          bookingStatusBooked: tFilters("bookingStatusBooked"),
          bookingStatusCompleted: tFilters("bookingStatusCompleted"),
          bookingStatusCancelled: tFilters("bookingStatusCancelled"),
          bookingStatusMissed: tFilters("bookingStatusMissed"),
          sortLabel: tFilters("sortLabel"),
          sortRevenueDesc: tFilters("sortRevenueDesc"),
          sortRevenueAsc: tFilters("sortRevenueAsc"),
          sortBookingsDesc: tFilters("sortBookingsDesc"),
          sortBookingsAsc: tFilters("sortBookingsAsc"),
          sortAttendanceDesc: tFilters("sortAttendanceDesc"),
          sortAttendanceAsc: tFilters("sortAttendanceAsc"),
          sortNameAsc: tFilters("sortNameAsc"),
          quickFilterLabel: tFilters("quickFilterLabel"),
          allQuickFilters: tFilters("allQuickFilters"),
          selectedCount: (count) => tFilters("selectedCount", { count }),
          quickToday: tFilters("quickToday"),
          quickWeek: tFilters("quickWeek"),
          quickMonth: tFilters("quickMonth"),
          quickLast30: tFilters("quickLast30"),
          quickTopCoaches: tFilters("quickTopCoaches"),
          quickPopularClasses: tFilters("quickPopularClasses"),
        },
      }),
    [filterOptions, section, tFilters],
  );

  const integratedFilterValues = useMemo(
    () => adminAnalyticsIntegratedFilterValues(values),
    [values],
  );

  useEffect(() => {
    setValues(initialValues);
    valuesFromUrlRef.current = true;
  }, [initialValues]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }
    if (valuesFromUrlRef.current) {
      valuesFromUrlRef.current = false;
      return undefined;
    }

    const handle = window.setTimeout(() => {
      const query = buildAnalyticsFiltersQuery(
        values,
        new URLSearchParams(searchParams.toString()),
        section,
      );
      if (query === searchParams.toString()) {
        return;
      }
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    }, FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [pathname, router, searchParams, section, values]);

  function handleFilterChange(key: string, value: string): void {
    setValues((current) => applyAnalyticsIntegratedFilterChange(key, value, current));
  }

  function resetFilters(): void {
    setValues(defaultAnalyticsFilterValues());
  }

  return (
    <AdminFinanceFiltersBar
      search={
        <AdminIntegratedSearchFilters
          className="min-w-0 flex-1"
          search=""
          onSearchChange={() => undefined}
          searchPlaceholder={tFilters("heading")}
          hideSearch
          fields={filterFields}
          filterValues={integratedFilterValues}
          onFilterChange={handleFilterChange}
          onClearAll={resetFilters}
          applyLabel={tSearchTools("applyFilters")}
          resetLabel={tFilters("resetFilters")}
          clearAriaLabel={tSearchTools("clearSearchAndFilters")}
          filterPanelAriaLabel={tSearchTools("filterPanelAria")}
          portalFilterPanel
        />
      }
      trailing={
        <>
          {trailing}
          {isPending ? (
            <p className="whitespace-nowrap text-xs text-sage-500" role="status">
              {tFilters("loading")}
            </p>
          ) : null}
        </>
      }
    />
  );
}
