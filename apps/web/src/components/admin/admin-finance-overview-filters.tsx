"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  adminFinanceIntegratedFilterValues,
  buildAdminFinanceFilterFields,
} from "@/components/admin/admin-finance-filter-fields";
import { AdminFinanceExportLinks } from "@/components/admin/admin-finance-export-links";
import { AdminFinanceFiltersBar } from "@/components/admin/admin-finance-filters-bar";
import { AdminIntegratedSearchFilters } from "@/components/admin/admin-integrated-search-filters";
import { computeFinanceFromDate } from "@/components/admin/admin-finance-dates";
import {
  buildFinanceOverviewFiltersQuery,
  parseFinanceDateRangeDays,
  parseFinanceOverviewFiltersFromSearch,
} from "@/components/admin/admin-finance-url";

const FILTER_DEBOUNCE_MS = 300;

type AdminFinanceOverviewFiltersProps = {
  initialRangeDays: ReturnType<typeof parseFinanceOverviewFiltersFromSearch>["rangeDays"];
};

export function AdminFinanceOverviewFilters({ initialRangeDays }: AdminFinanceOverviewFiltersProps) {
  const t = useTranslations("adminPages.finance");
  const tFilters = useTranslations("adminPages.finance.filters");
  const tSearchTools = useTranslations("adminPages.searchTools");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMounted = useRef(false);
  const [isPending, startTransition] = useTransition();
  const [rangeDays, setRangeDays] = useState(initialRangeDays);

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
      }).filter((field) => field.key === "rangeDays"),
    [tFilters],
  );

  const integratedFilterValues = useMemo(
    () => adminFinanceIntegratedFilterValues({ rangeDays, source: "all", status: "all" }),
    [rangeDays],
  );

  const fromIso = useMemo(() => computeFinanceFromDate(rangeDays), [rangeDays]);

  useEffect(() => {
    setRangeDays(initialRangeDays);
  }, [initialRangeDays]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }

    const handle = window.setTimeout(() => {
      const query = buildFinanceOverviewFiltersQuery(
        rangeDays,
        new URLSearchParams(searchParams.toString()),
      );
      if (query === searchParams.toString()) {
        return;
      }
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    }, FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [pathname, router, rangeDays]);

  function handleFilterChange(key: string, value: string): void {
    if (key === "rangeDays") {
      setRangeDays(parseFinanceDateRangeDays(value));
    }
  }

  function resetFilters(): void {
    setRangeDays(30);
  }

  const activeFilterCount = rangeDays === 30 ? 0 : 1;

  return (
    <AdminFinanceFiltersBar
      search={
        <AdminIntegratedSearchFilters
          className="min-w-0 flex-1"
          search=""
          onSearchChange={() => undefined}
          searchPlaceholder={tFilters("rangeLabel")}
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
          <AdminFinanceExportLinks
            fromIso={fromIso}
            paymentsLabel={t("exportPaymentsCsv")}
            giftCreditsLabel={t("exportGiftCreditsCsv")}
          />
          {isPending || activeFilterCount > 0 ? (
            <p className="whitespace-nowrap text-xs text-sage-500" role="status">
              {isPending ? tFilters("loading") : tFilters("activeCount", { count: activeFilterCount })}
            </p>
          ) : null}
        </>
      }
    />
  );
}
