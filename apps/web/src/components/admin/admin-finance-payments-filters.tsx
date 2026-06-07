"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminFinanceExportLinks } from "@/components/admin/admin-finance-export-links";
import { AdminFinanceFiltersBar } from "@/components/admin/admin-finance-filters-bar";
import {
  adminFinancePaymentsIntegratedFilterValues,
  buildAdminFinancePaymentsFilterFields,
} from "@/components/admin/admin-finance-payments-filter-fields";
import { buildFinancePaymentPackageFilterOptions } from "@/components/admin/admin-finance-payments-package-filter-options";
import { computeFinanceFromDate } from "@/components/admin/admin-finance-dates";
import type { FinanceFilterValues } from "@/components/admin/admin-finance-types";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import {
  buildFinancePaymentsFiltersQuery,
  FINANCE_PAYMENTS_PAGE_KEYS,
  parseFinanceDateRangeDays,
  parseFinancePackageClassFilter,
  parseFinancePackagePlanFilter,
  parseFinancePackageSessionsFilter,
  parseFinanceSourceFilter,
  parseFinanceStatusFilter,
} from "@/components/admin/admin-finance-url";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { usePropSyncedState } from "@/hooks/use-prop-synced-state";
import { apiFetch } from "@/lib/api";
import { resetListPageQuery } from "@/lib/list-pagination";

const FILTER_DEBOUNCE_MS = 300;

const DEFAULT_FINANCE_PAYMENTS_FILTERS: FinanceFilterValues = {
  q: "",
  rangeDays: 30,
  source: "all",
  status: "all",
  planId: "all",
  packageClass: "all",
  sessions: "all",
};

type AdminFinancePaymentsFiltersProps = {
  initialValues: FinanceFilterValues;
};

export function AdminFinancePaymentsFilters({ initialValues }: AdminFinancePaymentsFiltersProps) {
  const t = useTranslations("adminPages.finance");
  const tFilters = useTranslations("adminPages.finance.filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMounted = useRef(false);
  const [, startTransition] = useTransition();
  const [values, setValues] = usePropSyncedState(initialValues);
  const [packagePlans, setPackagePlans] = useState<readonly AdminPackageRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    void apiFetch<AdminPackageRow[]>("/packages/admin/plans")
      .then((plans) => {
        if (!cancelled) {
          setPackagePlans(plans);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPackagePlans([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const packageFilterOptions = useMemo(
    () =>
      buildFinancePaymentPackageFilterOptions({
        plans: packagePlans,
        labels: {
          sessions: (count) => tFilters("sessionsCount", { count }),
          unlimited: tFilters("sessionsUnlimited"),
        },
      }),
    [packagePlans, tFilters],
  );

  const filterFields = useMemo(
    () =>
      buildAdminFinancePaymentsFilterFields({
        labels: {
          rangeLabel: tFilters("rangeLabel"),
          range7: tFilters("range7"),
          range30: tFilters("range30"),
          range90: tFilters("range90"),
          sourceLabel: tFilters("sourceLabel"),
          sourceAll: tFilters("sourceAll"),
          sourcePackage: tFilters("sourcePackage"),
          sourceDropIn: tFilters("sourceDropIn"),
          sourceGift: tFilters("sourceGift"),
          sourceOther: tFilters("sourceOther"),
          statusLabel: tFilters("statusLabel"),
          statusAll: tFilters("statusAll"),
          statusSucceeded: tFilters("statusSucceeded"),
          statusFailed: tFilters("statusFailed"),
          statusPending: tFilters("statusPending"),
          statusRefunded: tFilters("statusRefunded"),
          packageLabel: tFilters("packageLabel"),
          packageAll: tFilters("packageAll"),
          packageClassLabel: tFilters("packageClassLabel"),
          packageClassAll: tFilters("packageClassAll"),
          sessionsLabel: tFilters("sessionsLabel"),
          sessionsAll: tFilters("sessionsAll"),
          noPackages: tFilters("noPackages"),
          noClasses: tFilters("noClasses"),
          noSessions: tFilters("noSessions"),
        },
        packageOptions: packageFilterOptions,
      }),
    [packageFilterOptions, tFilters],
  );

  const integratedFilterValues = useMemo(
    () => adminFinancePaymentsIntegratedFilterValues(values),
    [values],
  );

  const fromIso = useMemo(() => computeFinanceFromDate(values.rangeDays), [values.rangeDays]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }

    const handle = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      resetListPageQuery(params, FINANCE_PAYMENTS_PAGE_KEYS);
      const query = buildFinancePaymentsFiltersQuery(values, params);
      if (query === searchParams.toString()) {
        return;
      }
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    }, FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [pathname, router, searchParams, values]);

  function updateField<K extends keyof FinanceFilterValues>(
    key: K,
    value: FinanceFilterValues[K],
  ): void {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function resetFilters(): void {
    setValues(DEFAULT_FINANCE_PAYMENTS_FILTERS);
  }

  function handleIntegratedFilterChange(key: string, value: string): void {
    switch (key) {
      case "rangeDays":
        updateField("rangeDays", parseFinanceDateRangeDays(value));
        break;
      case "source":
        updateField("source", parseFinanceSourceFilter(value));
        break;
      case "status":
        updateField("status", parseFinanceStatusFilter(value));
        break;
      case "planId":
        updateField("planId", parseFinancePackagePlanFilter(value));
        break;
      case "packageClass":
        updateField("packageClass", parseFinancePackageClassFilter(value));
        break;
      case "sessions":
        updateField("sessions", parseFinancePackageSessionsFilter(value));
        break;
      default:
        break;
    }
  }

  return (
    <AdminFinanceFiltersBar
      search={
        <ListPageSearchFilters
          search={values.q}
          onSearchChange={(value) => updateField("q", value)}
          searchPlaceholder={tFilters("searchPlaceholder")}
          fields={filterFields}
          filterValues={integratedFilterValues}
          onFilterChange={handleIntegratedFilterChange}
          onClearAll={resetFilters}
          resetLabel={tFilters("resetFilters")}
        />
      }
      trailing={
        <AdminFinanceExportLinks fromIso={fromIso} paymentsLabel={t("exportPaymentsCsv")} />
      }
    />
  );
}
