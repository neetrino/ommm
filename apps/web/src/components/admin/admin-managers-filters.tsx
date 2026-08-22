"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  adminManagersIntegratedFilterValues,
  buildAdminManagersFilterFields,
} from "@/components/admin/admin-managers-filter-fields";
import type { AdminManagersFilterValues } from "@/components/admin/admin-managers-types";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";
import { resetListPageQuery } from "@/lib/list-pagination";

const FILTER_DEBOUNCE_MS = 300;
const FILTER_QUERY_KEYS = ["q", "status", "order"] as const;

type AdminManagersFiltersProps = {
  initialValues: AdminManagersFilterValues;
  onAddManager?: () => void;
};

function AddManagerGlyph({ className }: { className?: string }) {
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
  values: AdminManagersFilterValues,
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
  if (values.status !== "all") {
    params.set("status", values.status);
  }
  if (values.order !== "newest") {
    params.set("order", values.order);
  }
  return params.toString();
}

export function AdminManagersFilters({
  initialValues,
  onAddManager,
}: AdminManagersFiltersProps) {
  const t = useTranslations("adminPages.managers");
  const tFilters = useTranslations("adminPages.managers.filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMounted = useRef(false);
  const [, startTransition] = useTransition();
  const [values, setValues] = useState(initialValues);
  const searchParamsRef = useRef(searchParams.toString());

  useEffect(() => {
    searchParamsRef.current = searchParams.toString();
  }, [searchParams]);

  const filterFields = useMemo(
    () =>
      buildAdminManagersFilterFields({
        labels: {
          status: tFilters("statusLabel"),
          statusAll: tFilters("statusAll"),
          statusActive: tFilters("statusActive"),
          statusBlocked: tFilters("statusBlocked"),
          order: tFilters("orderLabel"),
          orderNewest: tFilters("orderNewest"),
          orderOldest: tFilters("orderOldest"),
        },
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
    [tFilters],
  );

  const integratedFilterValues = useMemo(
    () =>
      adminManagersIntegratedFilterValues({
        status: values.status,
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
      const query = buildQuery(values, new URLSearchParams(searchParamsRef.current));
      if (query === searchParamsRef.current) {
        return;
      }
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    }, FILTER_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [pathname, router, values]);

  function updateField<K extends keyof AdminManagersFilterValues>(
    key: K,
    value: AdminManagersFilterValues[K],
  ): void {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleIntegratedFilterChange(key: string, value: string): void {
    if (key === "status") {
      updateField(
        "status",
        value === "active" || value === "blocked" ? value : "all",
      );
      return;
    }
    if (key === "order") {
      updateField("order", value === "oldest" ? "oldest" : "newest");
    }
  }

  return (
    <AdminPageHero
      title={t("title")}
      search={
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <ListPageSearchFilters
            search={values.q}
            onSearchChange={(value) => updateField("q", value)}
            searchPlaceholder={tFilters("searchPlaceholder")}
            fields={filterFields}
            filterValues={integratedFilterValues}
            onFilterChange={handleIntegratedFilterChange}
            onClearAll={() =>
              setValues({ q: "", status: "all", order: "newest" })
            }
            resetLabel={tFilters("resetFilters")}
          />
        </div>
      }
      trailing={
        onAddManager ? (
          <OmmButton
            type="button"
            variant="secondary"
            size="md"
            onClick={onAddManager}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full"
          >
            <AddManagerGlyph className="h-5 w-5 shrink-0" />
            {t("addManagerButton")}
          </OmmButton>
        ) : null
      }
    />
  );
}
