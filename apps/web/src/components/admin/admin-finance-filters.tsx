"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  adminFinanceIntegratedFilterValues,
  buildAdminFinanceFilterFields,
} from "@/components/admin/admin-finance-filter-fields";
import { AdminIntegratedSearchFilters } from "@/components/admin/admin-integrated-search-filters";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import type { FinanceFilterValues } from "@/components/admin/admin-finance-types";
import {
  buildFinanceFiltersQuery,
  parseFinanceDateRangeDays,
  parseFinanceSourceFilter,
  parseFinanceStatusFilter,
} from "@/components/admin/admin-finance-url";

const FILTER_DEBOUNCE_MS = 300;

type AdminFinanceFiltersProps = {
  initialValues: FinanceFilterValues;
};

export function AdminFinanceFilters({ initialValues }: AdminFinanceFiltersProps) {
  const t = useTranslations("adminPages.finance");
  const tFilters = useTranslations("adminPages.finance.filters");
  const tSearchTools = useTranslations("adminPages.searchTools");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMounted = useRef(false);
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(initialValues);

  const activeFilterCount = useMemo(
    () =>
      [
        values.q.trim(),
        values.rangeDays === 30 ? "" : String(values.rangeDays),
        values.source === "all" ? "" : values.source,
        values.status === "all" ? "" : values.status,
      ].filter(Boolean).length,
    [values],
  );

  const filterFields = useMemo(
    () =>
      buildAdminFinanceFilterFields({
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
        },
      }),
    [tFilters],
  );

  const integratedFilterValues = useMemo(
    () =>
      adminFinanceIntegratedFilterValues({
        rangeDays: values.rangeDays,
        source: values.source,
        status: values.status,
      }),
    [values],
  );

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }

    const handle = window.setTimeout(() => {
      const query = buildFinanceFiltersQuery(values, new URLSearchParams(searchParams.toString()));
      const currentQuery = searchParams.toString();
      if (query === currentQuery) {
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
    setValues({
      q: "",
      rangeDays: 30,
      source: "all",
      status: "all",
    });
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
      default:
        break;
    }
  }

  return (
    <AdminPageHero
      title={t("title")}
      description={t("description")}
      search={
        <AdminIntegratedSearchFilters
          className="min-w-0 flex-1"
          search={values.q}
          onSearchChange={(value) => updateField("q", value)}
          searchPlaceholder={tFilters("searchPlaceholder")}
          fields={filterFields}
          filterValues={integratedFilterValues}
          onFilterChange={handleIntegratedFilterChange}
          onClearAll={resetFilters}
          applyLabel={tSearchTools("applyFilters")}
          resetLabel={tFilters("resetFilters")}
          clearAriaLabel={tSearchTools("clearSearchAndFilters")}
          filterPanelAriaLabel={tSearchTools("filterPanelAria")}
        />
      }
      trailing={
        isPending || activeFilterCount > 0 ? (
          <p className="whitespace-nowrap text-xs text-sage-500" role="status">
            {isPending ? tFilters("loading") : tFilters("activeCount", { count: activeFilterCount })}
          </p>
        ) : undefined
      }
    />
  );
}

export type { FinanceFilterValues } from "@/components/admin/admin-finance-types";
