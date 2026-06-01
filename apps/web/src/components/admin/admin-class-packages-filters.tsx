"use client";

import { useTranslations } from "next-intl";
import { OmmFilterDropdown, OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";
import { OmmButton } from "@/components/ui/omm-button";
import type { ClassPackageQuickFilter, ClassPackageSortOrder } from "@/components/admin/admin-class-packages-types";

export type ClassPackageFilterValues = {
  search: string;
  level: string;
  coachId: string;
  order: ClassPackageSortOrder;
  quick: ClassPackageQuickFilter;
};

type CoachFilterOption = {
  id: string;
  label: string;
};

type AdminClassPackagesFiltersProps = {
  values: ClassPackageFilterValues;
  coachOptions: readonly CoachFilterOption[];
  activeFilterCount: number;
  onChange: <K extends keyof ClassPackageFilterValues>(
    key: K,
    value: ClassPackageFilterValues[K],
  ) => void;
  onReset: () => void;
};

const SORT_OPTIONS: readonly ClassPackageSortOrder[] = [
  "newest",
  "oldest",
  "capacityHigh",
  "capacityLow",
  "priceHigh",
  "priceLow",
];

const SORT_LABEL_KEYS: Record<ClassPackageSortOrder, string> = {
  newest: "sortNewest",
  oldest: "sortOldest",
  capacityHigh: "sortCapacityHigh",
  capacityLow: "sortCapacityLow",
  priceHigh: "sortPriceHigh",
  priceLow: "sortPriceLow",
};

const QUICK_FILTERS: readonly ClassPackageQuickFilter[] = [
  "",
  "popular",
  "highCapacity",
  "lowCapacity",
  "beginner",
  "advanced",
  "withCoaches",
];

export function AdminClassPackagesFilters({
  values,
  coachOptions,
  activeFilterCount,
  onChange,
  onReset,
}: AdminClassPackagesFiltersProps) {
  const t = useTranslations("adminPages.packages.filters");

  const quickLabel =
    values.quick === "" ? t("quickAll") : t(`quick.${values.quick}`);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">
            {t("quickFilter")}
          </span>
          <OmmSelectDropdown
            ariaLabel={t("quickFilter")}
            label={quickLabel}
            value={values.quick}
            options={QUICK_FILTERS.map((quick) => ({
              value: quick,
              label: quick === "" ? t("quickAll") : t(`quick.${quick}`),
            }))}
            onChange={(value) => onChange("quick", value as ClassPackageQuickFilter)}
          />
        </div>
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
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("level")}</span>
          <input
            className="ommm-input"
            value={values.level}
            onChange={(event) => onChange("level", event.target.value)}
            placeholder={t("levelPlaceholder")}
            aria-label={t("level")}
          />
        </label>
        <div className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("coach")}</span>
          <OmmFilterDropdown
            allValue=""
            value={values.coachId}
            ariaLabel={t("coach")}
            allLabel={t("coachAll")}
            onChange={(value) => onChange("coachId", value)}
            options={coachOptions.map((coach) => ({ value: coach.id, label: coach.label }))}
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
            onChange={(value) => onChange("order", value as ClassPackageSortOrder)}
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
