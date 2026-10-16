"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  couponAnalyticsFilterChoices,
  couponFilterLabels,
  emptyCouponAnalyticsFilterChoices,
  type CouponAnalyticsFilterChoices,
} from "@/components/admin/admin-analytics-coupon-filters";
import type { AdminCouponRow } from "@/components/admin/admin-coupons-types";
import { usePathname, useRouter } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
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
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { usePropSyncedState } from "@/hooks/use-prop-synced-state";

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
  const tCoupons = useTranslations("adminPages.coupons");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMounted = useRef(false);
  const [, startTransition] = useTransition();
  const [values, setValues] = usePropSyncedState(initialValues);
  const [couponChoices, setCouponChoices] = useState<CouponAnalyticsFilterChoices>(
    emptyCouponAnalyticsFilterChoices,
  );

  useEffect(() => {
    if (section !== "coupons") {
      return undefined;
    }
    let cancelled = false;
    void apiFetch<AdminCouponRow[]>("/coupons")
      .then((rows) => {
        if (!cancelled) {
          setCouponChoices(couponAnalyticsFilterChoices(rows));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCouponChoices(emptyCouponAnalyticsFilterChoices());
        }
      });
    return () => {
      cancelled = true;
    };
  }, [section]);

  const couponFilters = useMemo(
    () => (section === "coupons" ? { choices: couponChoices, labels: couponFilterLabels(tCoupons) } : undefined),
    [couponChoices, section, tCoupons],
  );

  const filterFields = useMemo(
    () =>
      buildAdminAnalyticsFilterFields({
        section,
        filterOptions,
        customFrom: values.from,
        customTo: values.to,
        couponFilters,
        labels: {
          rangeLabel: tFilters("rangeLabel"),
          range7: tFilters("range7"),
          range30: tFilters("range30"),
          range90: tFilters("range90"),
          dateFrom: tFilters("dateFrom"),
          dateTo: tFilters("dateTo"),
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
    [couponFilters, filterOptions, section, tFilters, values.from, values.to],
  );

  const integratedFilterValues = useMemo(
    () => adminAnalyticsIntegratedFilterValues(values),
    [values],
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
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
        <ListPageSearchFilters
          search=""
          onSearchChange={() => undefined}
          searchPlaceholder={tFilters("heading")}
          hideSearch
          fields={filterFields}
          filterValues={integratedFilterValues}
          onFilterChange={handleFilterChange}
          onClearAll={resetFilters}
          resetLabel={tFilters("resetFilters")}
        />
      }
      trailing={trailing}
    />
  );
}
