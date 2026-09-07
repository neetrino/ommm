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
import { usePropSyncedState } from "@/hooks/use-prop-synced-state";
import { resetListPageQuery } from "@/lib/list-pagination";

const FILTER_DEBOUNCE_MS = 300;

type AdminFinanceCoachPayoutHistoryFiltersProps = {
  initialValues: CoachSalaryPayoutHistoryFilters;
};

function buildPayoutHistoryFilterFields(labels: {
  monthLabel: string;
  allMonths: string;
}): AdminIntegratedFilterField[] {
  return [
    {
      key: "month",
      label: labels.monthLabel,
      fieldType: "custom",
      resolveChipLabel: (value) =>
        value ? `${labels.monthLabel}: ${value}` : null,
      render: ({ value, onChange }) => (
        <div className="space-y-2">
          <input
            type="month"
            className="ommm-input h-10 w-full"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-label={labels.monthLabel}
          />
          {value ? (
            <button
              type="button"
              className="text-xs font-medium text-sage-600 underline-offset-2 hover:text-sage-800 hover:underline"
              onClick={() => onChange("")}
            >
              {labels.allMonths}
            </button>
          ) : null}
        </div>
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
        allMonths: t("allMonths"),
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
