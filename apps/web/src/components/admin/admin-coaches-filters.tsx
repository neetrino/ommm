"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { AdminCoachesFilterValues } from "@/components/admin/admin-coaches-types";
import {
  adminCoachesIntegratedFilterValues,
  buildAdminCoachesFilterFields,
} from "@/components/admin/admin-coaches-filter-fields";
import { AdminCoachesViewSwitcher } from "@/components/admin/admin-coaches-view-switcher";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";
import type { AdminCoachesViewMode } from "@/lib/admin-coaches-view-preference";
import { resetListPageQuery } from "@/lib/list-pagination";

export type { AdminCoachesFilterValues } from "@/components/admin/admin-coaches-types";

type AdminCoachesFiltersProps = {
  initialValues: AdminCoachesFilterValues;
  classTypeOptions: readonly string[];
  viewMode: AdminCoachesViewMode;
  onViewChange: (mode: AdminCoachesViewMode) => void;
  onAddCoach?: () => void;
  /** Staff layout: search row only (hero lives in StaffListPageLayout). */
  variant?: "full" | "embedded";
};

export function countActiveCoachesFilters(values: AdminCoachesFilterValues): number {
  return [
    values.q.trim(),
    values.specialization.trim(),
    values.classType.trim(),
    values.isActive === "all" ? "" : values.isActive,
    values.order === "newest" ? "" : values.order,
  ].filter(Boolean).length;
}

const FILTER_DEBOUNCE_MS = 300;
const FILTER_QUERY_KEYS = ["q", "specialization", "classType", "isActive", "order"] as const;

function AddCoachGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.65}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6m3-3h-6" />
    </svg>
  );
}

function buildQuery(
  values: AdminCoachesFilterValues,
  currentSearchParams: URLSearchParams,
): string {
  const params = new URLSearchParams(currentSearchParams.toString());
  for (const key of FILTER_QUERY_KEYS) {
    params.delete(key);
  }
  resetListPageQuery(params);
  if (values.q.trim() !== "") {
    params.set("q", values.q.trim());
  }
  if (values.specialization.trim() !== "") {
    params.set("specialization", values.specialization.trim());
  }
  if (values.classType.trim() !== "") {
    params.set("classType", values.classType.trim());
  }
  if (values.isActive !== "all") {
    params.set("isActive", values.isActive);
  }
  if (values.order !== "newest") {
    params.set("order", values.order);
  }
  return params.toString();
}

export function AdminCoachesFilters({
  initialValues,
  classTypeOptions,
  viewMode,
  onViewChange,
  onAddCoach,
  variant = "full",
}: AdminCoachesFiltersProps) {
  const t = useTranslations("adminPages.coaches");
  const tFilters = useTranslations("adminPages.coaches.filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMounted = useRef(false);
  const [, startTransition] = useTransition();
  const [values, setValues] = useState(initialValues);

  const filterFields = useMemo(
    () =>
      buildAdminCoachesFilterFields({
        classTypeOptions,
        labels: {
          specialization: tFilters("specializationLabel"),
          specializationPlaceholder: tFilters("specializationPlaceholder"),
          classType: tFilters("classTypeLabel"),
          classTypeAll: tFilters("classTypePlaceholder"),
          status: tFilters("statusLabel"),
          statusAll: tFilters("statusAll"),
          statusActive: tFilters("statusActive"),
          statusInactive: tFilters("statusInactive"),
          order: tFilters("orderLabel"),
          orderNewest: tFilters("orderNewest"),
          orderOldest: tFilters("orderOldest"),
        },
        renderSpecialization: ({ value, onChange }) => (
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={tFilters("specializationPlaceholder")}
            className="ommm-input h-10"
            aria-label={tFilters("specializationLabel")}
          />
        ),
        renderOrder: ({ value, onChange }) => (
          <OmmSelectDropdown
            ariaLabel={tFilters("orderLabel")}
            label={value === "oldest" ? tFilters("orderOldest") : tFilters("orderNewest")}
            value={value}
            options={[
              { value: "newest", label: tFilters("orderNewest") },
              { value: "oldest", label: tFilters("orderOldest") },
            ]}
            onChange={(next) => onChange(next === "oldest" ? "oldest" : "newest")}
          />
        ),
      }),
    [classTypeOptions, tFilters],
  );

  const integratedFilterValues = useMemo(
    () =>
      adminCoachesIntegratedFilterValues({
        specialization: values.specialization,
        classType: values.classType,
        isActive: values.isActive,
        order: values.order,
      }),
    [values],
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }

    const handle = window.setTimeout(() => {
      const query = buildQuery(values, new URLSearchParams(searchParams.toString()));
      const currentQuery = searchParams.toString();
      if (query === currentQuery) {
        return;
      }
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    }, FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [pathname, router, searchParams, values]);

  function updateField<K extends keyof AdminCoachesFilterValues>(
    key: K,
    value: AdminCoachesFilterValues[K],
  ): void {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function resetFilters(): void {
    setValues({
      q: "",
      specialization: "",
      classType: "",
      isActive: "all",
      order: "newest",
    });
  }

  function handleIntegratedFilterChange(key: string, value: string): void {
    switch (key) {
      case "specialization":
        updateField("specialization", value);
        break;
      case "classType":
        updateField("classType", value);
        break;
      case "isActive":
        updateField(
          "isActive",
          value === "active" || value === "inactive" ? value : "all",
        );
        break;
      case "order":
        updateField("order", value === "oldest" ? "oldest" : "newest");
        break;
      default:
        break;
    }
  }

  const filterSearchRow = (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <ListPageSearchFilters
        search={values.q}
        onSearchChange={(value) => updateField("q", value)}
        searchPlaceholder={tFilters("searchPlaceholder")}
        fields={filterFields}
        filterValues={integratedFilterValues}
        onFilterChange={handleIntegratedFilterChange}
        onClearAll={resetFilters}
        resetLabel={tFilters("resetFilters")}
      />
      <AdminCoachesViewSwitcher value={viewMode} onChange={onViewChange} />
    </div>
  );

  if (variant === "embedded") {
    return filterSearchRow;
  }

  return (
    <AdminPageHero
      title={t("title")}
      search={filterSearchRow}
      trailing={
        onAddCoach ? (
          <OmmButton
            type="button"
            variant="secondary"
            size="md"
            onClick={onAddCoach}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full"
          >
            <AddCoachGlyph className="h-5 w-5 shrink-0" />
            {t("addCoachButton")}
          </OmmButton>
        ) : null
      }
    />
  );
}
