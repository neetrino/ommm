"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  adminPackagesIntegratedFilterValues,
  buildAdminPackagesFilterFields,
} from "@/components/admin/admin-packages-filter-fields";
import type {
  PackageFilterValues,
  PackageSortOrder,
  PackageStatusFilter,
} from "@/components/admin/admin-packages-types";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";

type AdminPackagesFiltersProps = {
  values: PackageFilterValues;
  onChange: <K extends keyof PackageFilterValues>(
    key: K,
    value: PackageFilterValues[K],
  ) => void;
  onReset: () => void;
};

const SORT_LABEL_KEYS: Record<PackageSortOrder, string> = {
  displayOrder: "sortDisplayOrder",
  newest: "sortNewest",
  oldest: "sortOldest",
  priceHigh: "sortPriceHigh",
  priceLow: "sortPriceLow",
};

export function AdminPackagesFilters({ values, onChange, onReset }: AdminPackagesFiltersProps) {
  const t = useTranslations("adminPages.packages.filters");

  const filterFields = useMemo(
    () =>
      buildAdminPackagesFilterFields({
        labels: {
          status: t("status"),
          statusAll: t("statusAll"),
          statusActive: t("statusActive"),
          statusInactive: t("statusInactive"),
          sort: t("sort"),
          sortLabels: {
            displayOrder: t(SORT_LABEL_KEYS.displayOrder),
            newest: t(SORT_LABEL_KEYS.newest),
            oldest: t(SORT_LABEL_KEYS.oldest),
            priceHigh: t(SORT_LABEL_KEYS.priceHigh),
            priceLow: t(SORT_LABEL_KEYS.priceLow),
          },
        },
      }),
    [t],
  );

  const integratedFilterValues = useMemo(
    () => adminPackagesIntegratedFilterValues(values),
    [values],
  );

  function handleIntegratedFilterChange(key: string, value: string): void {
    switch (key) {
      case "status":
        onChange("status", value as PackageStatusFilter);
        break;
      case "order":
        onChange("order", value as PackageSortOrder);
        break;
      default:
        break;
    }
  }

  return (
    <ListPageSearchFilters
      search={values.search}
      onSearchChange={(value) => onChange("search", value)}
      searchPlaceholder={t("searchPlaceholder")}
      fields={filterFields}
      filterValues={integratedFilterValues}
      onFilterChange={handleIntegratedFilterChange}
      onClearAll={onReset}
      resetLabel={t("reset")}
    />
  );
}
