"use client";

import { useEffect, useMemo, useRef, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import { AdminFinanceExportLinks } from "@/components/admin/admin-finance-export-links";
import { AdminFinanceFiltersBar } from "@/components/admin/admin-finance-filters-bar";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import {
  resolveFinancePaymentsDateRange,
  resolveFinanceStudioDateRange,
} from "@/components/admin/admin-finance-dates";
import { DEFAULT_FINANCE_OVERVIEW_RANGE } from "@/components/admin/admin-finance-types";
import { usePropSyncedState } from "@/hooks/use-prop-synced-state";
import { buildFinanceOverviewFiltersQuery } from "@/components/admin/admin-finance-url";
import { formatFilterDateChipLabel } from "@/lib/filter-date-display";

const FILTER_DEBOUNCE_MS = 300;

type AdminFinanceOverviewFiltersProps = {
  initialFrom: string;
  initialTo: string;
};

function buildOverviewDateFilterField(
  key: "from" | "to",
  label: string,
): AdminIntegratedFilterField {
  return {
    key,
    label,
    fieldType: "date",
    emptyValue: "",
    resolveChipLabel: (value) => formatFilterDateChipLabel(label, value),
  };
}

export function AdminFinanceOverviewFilters({
  initialFrom,
  initialTo,
}: AdminFinanceOverviewFiltersProps) {
  const t = useTranslations("adminPages.finance");
  const tFilters = useTranslations("adminPages.finance.filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMounted = useRef(false);
  const [, startTransition] = useTransition();
  const [from, setFrom] = usePropSyncedState(initialFrom);
  const [to, setTo] = usePropSyncedState(initialTo);

  const filterFields = useMemo(
    () => [
      buildOverviewDateFilterField("from", tFilters("dateFrom")),
      buildOverviewDateFilterField("to", tFilters("dateTo")),
    ],
    [tFilters],
  );

  const integratedFilterValues = useMemo(
    () => ({ from, to }),
    [from, to],
  );

  const exportRange = useMemo(() => {
    const custom = resolveFinancePaymentsDateRange(from, to);
    if (custom.from || custom.to) {
      return {
        from: custom.from ?? custom.to ?? "",
        to: custom.to ?? custom.from ?? "",
      };
    }
    return resolveFinanceStudioDateRange(DEFAULT_FINANCE_OVERVIEW_RANGE);
  }, [from, to]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }

    const handle = window.setTimeout(() => {
      const query = buildFinanceOverviewFiltersQuery(
        { from, to },
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
  }, [pathname, router, searchParams, from, to]);

  function handleFilterChange(key: string, value: string): void {
    if (key === "from") {
      setFrom(value);
      return;
    }
    if (key === "to") {
      setTo(value);
    }
  }

  function resetFilters(): void {
    setFrom("");
    setTo("");
  }

  return (
    <AdminFinanceFiltersBar
      search={
        <ListPageSearchFilters
          search=""
          onSearchChange={() => undefined}
          searchPlaceholder={tFilters("dateFrom")}
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
          from={exportRange.from}
          to={exportRange.to}
          menuAriaLabel={t("exportMenuAria")}
          paymentsLabel={t("exportPaymentsCsv")}
          giftCreditsLabel={t("exportGiftCreditsCsv")}
        />
      }
    />
  );
}
