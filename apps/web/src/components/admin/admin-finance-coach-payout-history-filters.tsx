"use client";

import { useEffect, useRef, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminFinanceFiltersBar } from "@/components/admin/admin-finance-filters-bar";
import type { CoachSalaryPayoutHistoryFilters } from "@/components/admin/admin-finance-types";
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
          onClearAll={() => setValues({ ...values, q: "" })}
          resetLabel={t("clearFilters")}
        />
      }
    />
  );
}
