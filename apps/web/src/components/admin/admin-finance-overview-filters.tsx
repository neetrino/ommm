"use client";

import { useEffect, useMemo, useRef, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  adminFinanceIntegratedFilterValues,
  buildAdminFinanceFilterFields,
} from "@/components/admin/admin-finance-filter-fields";
import { AdminFinanceExportLinks } from "@/components/admin/admin-finance-export-links";
import { AdminFinanceFiltersBar } from "@/components/admin/admin-finance-filters-bar";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { computeFinanceFromDate } from "@/components/admin/admin-finance-dates";
import { usePropSyncedState } from "@/hooks/use-prop-synced-state";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMounted = useRef(false);
  const [, startTransition] = useTransition();
  const [rangeDays, setRangeDays] = usePropSyncedState(initialRangeDays);

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
  }, [pathname, router, searchParams, rangeDays]);

  function handleFilterChange(key: string, value: string): void {
    if (key === "rangeDays") {
      setRangeDays(parseFinanceDateRangeDays(value));
    }
  }

  function resetFilters(): void {
    setRangeDays(30);
  }

  return (
    <AdminFinanceFiltersBar
      search={
        <ListPageSearchFilters
          search=""
          onSearchChange={() => undefined}
          searchPlaceholder={tFilters("rangeLabel")}
          hideSearch
          fields={filterFields}
          filterValues={integratedFilterValues}
          onFilterChange={handleFilterChange}
          onClearAll={resetFilters}
          resetLabel={tFilters("resetFilters")}
        />
      }
      trailing={
        <AdminFinanceExportLinks
          fromIso={fromIso}
          paymentsLabel={t("exportPaymentsCsv")}
          giftCreditsLabel={t("exportGiftCreditsCsv")}
        />
      }
    />
  );
}
