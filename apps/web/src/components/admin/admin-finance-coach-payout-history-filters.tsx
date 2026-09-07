"use client";

import { useEffect, useMemo, useRef, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminFinanceFiltersBar } from "@/components/admin/admin-finance-filters-bar";
import type { CoachSalaryPayoutHistoryFilters } from "@/components/admin/admin-finance-types";
import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import {
  buildFinanceCoachPayoutHistoryFiltersQuery,
  FINANCE_COACH_PAYOUT_PAGE_KEYS,
} from "@/components/admin/admin-finance-url";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { usePropSyncedState } from "@/hooks/use-prop-synced-state";
import { formatFilterDateChipLabel } from "@/lib/filter-date-display";
import { resetListPageQuery } from "@/lib/list-pagination";

const FILTER_DEBOUNCE_MS = 300;
const YEAR_MONTH_PATTERN = /^\d{4}-\d{2}$/;

type AdminFinanceCoachPayoutHistoryFiltersProps = {
  initialValues: CoachSalaryPayoutHistoryFilters;
};

function monthToDatePickerValue(month: string): string {
  return YEAR_MONTH_PATTERN.test(month) ? `${month}-01` : "";
}

function datePickerValueToMonth(isoDate: string): string {
  const trimmed = isoDate.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return "";
  }
  return trimmed.slice(0, 7);
}

function buildPayoutHistoryFilterFields(labels: {
  monthLabel: string;
}): AdminIntegratedFilterField[] {
  return [
    {
      key: "month",
      label: labels.monthLabel,
      fieldType: "custom",
      resolveChipLabel: (value) =>
        formatFilterDateChipLabel(labels.monthLabel, monthToDatePickerValue(value)),
      render: ({ value, onChange }) => (
        <DatePickerInput
          name="month"
          value={monthToDatePickerValue(value)}
          onChange={(next) => onChange(datePickerValueToMonth(next))}
          ariaLabel={labels.monthLabel}
          placeholder={labels.monthLabel}
        />
      ),
    },
  ];
}

export function AdminFinanceCoachPayoutHistoryFilters({
  initialValues,
}: AdminFinanceCoachPayoutHistoryFiltersProps) {
  const t = useTranslations("adminPages.finance.coachPayoutHistory");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams.toString());
  const hasMounted = useRef(false);
  const [, startTransition] = useTransition();
  const [values, setValues] = usePropSyncedState(initialValues);

  useEffect(() => {
    searchParamsRef.current = searchParams.toString();
  }, [searchParams]);

  const filterFields = useMemo(
    () =>
      buildPayoutHistoryFilterFields({
        monthLabel: t("monthLabel"),
      }),
    [t],
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }

    const handle = window.setTimeout(() => {
      const currentSearchParams = searchParamsRef.current;
      const params = new URLSearchParams(currentSearchParams);
      resetListPageQuery(params, FINANCE_COACH_PAYOUT_PAGE_KEYS);
      const query = buildFinanceCoachPayoutHistoryFiltersQuery(values, params);
      if (query === currentSearchParams) {
        return;
      }
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    }, FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [pathname, router, values]);

  return (
    <AdminFinanceFiltersBar
      search={
        <ListPageSearchFilters
          search={values.q}
          onSearchChange={(value) => setValues({ ...values, q: value })}
          searchPlaceholder={t("searchPlaceholder")}
          fields={filterFields}
          filterValues={{ month: values.month }}
          onFilterChange={(key, value) => {
            if (key === "month") {
              setValues({ ...values, month: value });
            }
          }}
          onClearAll={() => setValues({ q: "", month: "" })}
          resetLabel={t("clearFilters")}
        />
      }
    />
  );
}
