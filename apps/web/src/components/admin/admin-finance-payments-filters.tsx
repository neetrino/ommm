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
import { type FinanceFilterValues } from "@/components/admin/admin-finance-types";
import {
  resolveFinancePaymentsDateRange,
} from "@/components/admin/admin-finance-dates";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import {
  buildFinancePaymentsFiltersQuery,
  FINANCE_PAYMENTS_PAGE_KEYS,
  parseFinancePaymentsDateFilter,
  parseFinancePackageClassFilter,
  parseFinancePackagePlanFilter,
  parseFinancePackageSessionsFilter,
  parseFinancePaymentMethodFilter,
  parseFinancePaymentsFiltersFromSearch,
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
  from: "",
  to: "",
  source: "all",
  status: "all",
  paymentMethod: "all",
  planId: "all",
  packageClass: "all",
  sessions: "all",
  order: "newest",
};

type AdminFinancePaymentsFiltersProps = {
  initialValues: FinanceFilterValues;
};

export function AdminFinancePaymentsFilters({ initialValues }: AdminFinancePaymentsFiltersProps) {
  const t = useTranslations("adminPages.finance");
  const tFilters = useTranslations("adminPages.finance.filters");
  const tSort = useTranslations("listSort");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMounted = useRef(false);
  const searchParamsRef = useRef(searchParams.toString());
  const [, startTransition] = useTransition();
  const [values, setValues] = usePropSyncedState(initialValues);

  useEffect(() => {
    searchParamsRef.current = searchParams.toString();
  }, [searchParams]);
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
          dateFrom: tFilters("dateFrom"),
          dateTo: tFilters("dateTo"),
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
          paymentMethodLabel: tFilters("paymentMethodLabel"),
          paymentMethodAll: tFilters("paymentMethodAll"),
          paymentMethodCash: t("paymentMethods.CASH"),
          paymentMethodCard: t("paymentMethods.CARD"),
          paymentMethodTerminal: t("paymentMethods.CARD_TERMINAL"),
          packageLabel: tFilters("packageLabel"),
          packageAll: tFilters("packageAll"),
          packageClassLabel: tFilters("packageClassLabel"),
          packageClassAll: tFilters("packageClassAll"),
          sessionsLabel: tFilters("sessionsLabel"),
          sessionsAll: tFilters("sessionsAll"),
          noPackages: tFilters("noPackages"),
          noClasses: tFilters("noClasses"),
          noSessions: tFilters("noSessions"),
          sort: tSort("sort"),
          sortNewest: tSort("newest"),
          sortOldest: tSort("oldest"),
        },
        packageOptions: packageFilterOptions,
      }),
    [packageFilterOptions, t, tFilters, tSort],
  );

  const integratedFilterValues = useMemo(
    () => adminFinancePaymentsIntegratedFilterValues(values),
    [values],
  );

  const paymentsRange = useMemo(
    () => resolveFinancePaymentsDateRange(values.from, values.to),
    [values.from, values.to],
  );

  const filterQuerySignature = useMemo(
    () => buildFinancePaymentsFiltersQuery(values, new URLSearchParams()),
    [values],
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }

    const handle = window.setTimeout(() => {
      const currentSearchParams = searchParamsRef.current;
      const urlFilterQuery = buildFinancePaymentsFiltersQuery(
        parseFinancePaymentsFiltersFromSearch(
          Object.fromEntries(new URLSearchParams(currentSearchParams).entries()),
        ),
        new URLSearchParams(),
      );
      if (urlFilterQuery === filterQuerySignature) {
        return;
      }

      const params = new URLSearchParams(currentSearchParams);
      resetListPageQuery(params, FINANCE_PAYMENTS_PAGE_KEYS);
      const query = buildFinancePaymentsFiltersQuery(values, params);
      if (query === currentSearchParams) {
        return;
      }
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    }, FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [filterQuerySignature, pathname, router, values]);

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
      case "from":
        updateField("from", parseFinancePaymentsDateFilter(value));
        break;
      case "to":
        updateField("to", parseFinancePaymentsDateFilter(value));
        break;
      case "source":
        updateField("source", parseFinanceSourceFilter(value));
        break;
      case "status":
        updateField("status", parseFinanceStatusFilter(value));
        break;
      case "paymentMethod":
        updateField("paymentMethod", parseFinancePaymentMethodFilter(value));
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
      case "order":
        updateField("order", value === "oldest" ? "oldest" : "newest");
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
        <AdminFinanceExportLinks
          from={paymentsRange.from}
          to={paymentsRange.to}
          paymentsLabel={t("exportPaymentsCsv")}
        />
      }
    />
  );
}
