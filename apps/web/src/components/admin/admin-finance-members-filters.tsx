"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminFinanceFiltersBar } from "@/components/admin/admin-finance-filters-bar";
import {
  adminFinanceMembersIntegratedFilterValues,
  buildAdminFinanceMembersFilterFields,
  parseMembersIntegratedFilterChange,
} from "@/components/admin/admin-finance-members-filter-fields";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import type { UserFinanceFilters } from "@/components/admin/admin-finance-types";
import {
  buildFinanceMembersFiltersQuery,
  FINANCE_USER_PAGE_KEYS,
} from "@/components/admin/admin-finance-url";
import { resetListPageQuery } from "@/lib/list-pagination";

const FILTER_DEBOUNCE_MS = 300;

type AdminFinanceMembersFiltersProps = {
  initialValues: UserFinanceFilters & { q: string };
};

type MembersFilterState = UserFinanceFilters & { q: string };

export function AdminFinanceMembersFilters({ initialValues }: AdminFinanceMembersFiltersProps) {
  const tFilters = useTranslations("adminPages.finance.userTab");
  const tFinanceFilters = useTranslations("adminPages.finance.filters");
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
        values.paymentStatus,
        values.order === "newest" ? "" : values.order,
        values.giftCardOnly ? "gift" : "",
        values.quick,
      ].filter(Boolean).length,
    [values],
  );

  const filterFields = useMemo(
    () =>
      buildAdminFinanceMembersFilterFields({
        labels: {
          paymentStatusLabel: tFilters("filterPaymentStatus"),
          paymentStatusAll: tFilters("filterAll"),
          statusPaid: tFilters("statusPaid"),
          statusUnpaid: tFilters("statusUnpaid"),
          statusOverdue: tFilters("statusOverdue"),
          statusPartial: tFilters("statusPartial"),
          sortLabel: tFilters("sortLabel"),
          sortNewest: tFilters("sortNewest"),
          sortOldest: tFilters("sortOldest"),
          sortHighestCost: tFilters("sortHighestCost"),
          sortLowestCost: tFilters("sortLowestCost"),
          giftCardLabel: tFilters("giftCardOnly"),
          giftCardAll: tFilters("filterAll"),
          giftCardOnly: tFilters("giftCardOnly"),
        },
      }),
    [tFilters],
  );

  const integratedFilterValues = useMemo(
    () =>
      adminFinanceMembersIntegratedFilterValues({
        paymentStatus: values.paymentStatus,
        order: values.order,
        giftCardOnly: values.giftCardOnly,
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
      const params = new URLSearchParams(searchParams.toString());
      resetListPageQuery(params, FINANCE_USER_PAGE_KEYS);
      const query = buildFinanceMembersFiltersQuery(values, params);
      if (query === searchParams.toString()) {
        return;
      }
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    }, FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [pathname, router, values]);

  function updateValues(next: MembersFilterState): void {
    setValues(next);
  }

  function resetFilters(): void {
    setValues({
      q: "",
      search: "",
      paymentStatus: "",
      giftCardOnly: false,
      order: "newest",
      quick: "",
    });
  }

  function handleIntegratedFilterChange(key: string, value: string): void {
    updateValues({ ...parseMembersIntegratedFilterChange(key, value, values), q: values.q });
  }

  return (
    <AdminFinanceFiltersBar
      search={
        <ListPageSearchFilters
          search={values.q}
          onSearchChange={(value) => updateValues({ ...values, q: value, search: value })}
          searchPlaceholder={tFilters("searchPlaceholder")}
          fields={filterFields}
          filterValues={integratedFilterValues}
          onFilterChange={handleIntegratedFilterChange}
          onClearAll={resetFilters}
          resetLabel={tFilters("clearFilters")}
        />
      }
    />
  );
}
