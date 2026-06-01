"use client";

import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmFilterDropdown, OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";
import type {
  PackageFilterValues,
  PackageSortOrder,
  PackageStatusFilter,
} from "@/components/admin/admin-packages-types";

type AdminPackagesFiltersProps = {
  values: PackageFilterValues;
  activeFilterCount: number;
  onChange: <K extends keyof PackageFilterValues>(
    key: K,
    value: PackageFilterValues[K],
  ) => void;
  onReset: () => void;
};

const SORT_OPTIONS: readonly PackageSortOrder[] = [
  "displayOrder",
  "newest",
  "oldest",
  "priceHigh",
  "priceLow",
];

const SORT_LABEL_KEYS: Record<PackageSortOrder, string> = {
  displayOrder: "sortDisplayOrder",
  newest: "sortNewest",
  oldest: "sortOldest",
  priceHigh: "sortPriceHigh",
  priceLow: "sortPriceLow",
};

export function AdminPackagesFilters({
  values,
  activeFilterCount,
  onChange,
  onReset,
}: AdminPackagesFiltersProps) {
  const t = useTranslations("adminPages.packages.filters");

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("search")}</span>
          <input
            className="ommm-input"
            value={values.search}
            onChange={(event) => onChange("search", event.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("search")}
          />
        </label>
        <div className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("status")}</span>
          <OmmFilterDropdown
            allValue="all"
            value={values.status}
            ariaLabel={t("status")}
            allLabel={t("statusAll")}
            onChange={(value) => onChange("status", value as PackageStatusFilter)}
            options={[
              { value: "active", label: t("statusActive") },
              { value: "inactive", label: t("statusInactive") },
            ]}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("sort")}</span>
          <OmmSelectDropdown
            ariaLabel={t("sort")}
            label={t(SORT_LABEL_KEYS[values.order])}
            value={values.order}
            options={SORT_OPTIONS.map((option) => ({
              value: option,
              label: t(SORT_LABEL_KEYS[option]),
            }))}
            onChange={(value) => onChange("order", value as PackageSortOrder)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {activeFilterCount > 0 ? (
          <span className="text-xs text-sage-600">
            {t("activeCount", { count: activeFilterCount })}
          </span>
        ) : null}
        <OmmButton type="button" variant="ghost" size="sm" onClick={onReset}>
          {t("reset")}
        </OmmButton>
      </div>
    </div>
  );
}
