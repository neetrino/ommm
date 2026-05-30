"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { OmmButton } from "@/components/ui/omm-button";

export type AdminCoachesFilterValues = {
  q: string;
  specialization: string;
  classType: string;
  isActive: "all" | "active" | "inactive";
  order: "newest" | "oldest";
};

type AdminCoachesFiltersProps = {
  initialValues: AdminCoachesFilterValues;
  classTypeOptions: readonly string[];
};

const FILTER_DEBOUNCE_MS = 300;
const FILTER_QUERY_KEYS = ["q", "specialization", "classType", "isActive", "order"] as const;

function buildQuery(
  values: AdminCoachesFilterValues,
  currentSearchParams: URLSearchParams,
): string {
  const params = new URLSearchParams(currentSearchParams.toString());
  for (const key of FILTER_QUERY_KEYS) {
    params.delete(key);
  }
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
}: AdminCoachesFiltersProps) {
  const t = useTranslations("adminPages.coaches.filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMounted = useRef(false);
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(initialValues);
  const activeFilterCount = useMemo(() => {
    return [
      values.q.trim(),
      values.specialization.trim(),
      values.classType.trim(),
      values.isActive === "all" ? "" : values.isActive,
      values.order === "newest" ? "" : values.order,
    ].filter(Boolean).length;
  }, [values]);

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

  return (
    <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/70 p-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <label className="flex flex-col gap-1 text-xs text-sage-700 sm:col-span-2 xl:col-span-1">
          <span>{t("searchLabel")}</span>
          <input
            value={values.q}
            onChange={(event) => updateField("q", event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="ommm-input h-10"
            aria-label={t("searchLabel")}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-sage-700">
          <span>{t("specializationLabel")}</span>
          <input
            value={values.specialization}
            onChange={(event) => updateField("specialization", event.target.value)}
            placeholder={t("specializationPlaceholder")}
            className="ommm-input h-10"
            aria-label={t("specializationLabel")}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-sage-700">
          <span>{t("classTypeLabel")}</span>
          <select
            value={values.classType}
            onChange={(event) => updateField("classType", event.target.value)}
            className="ommm-input h-10"
            aria-label={t("classTypeLabel")}
          >
            <option value="">{t("classTypePlaceholder")}</option>
            {classTypeOptions.map((classType) => (
              <option key={classType} value={classType}>
                {classType}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-sage-700">
          <span>{t("statusLabel")}</span>
          <select
            value={values.isActive}
            onChange={(event) =>
              updateField(
                "isActive",
                event.target.value === "active" || event.target.value === "inactive"
                  ? event.target.value
                  : "all",
              )
            }
            className="ommm-input h-10"
            aria-label={t("statusLabel")}
          >
            <option value="all">{t("statusAll")}</option>
            <option value="active">{t("statusActive")}</option>
            <option value="inactive">{t("statusInactive")}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-sage-700">
          <span>{t("orderLabel")}</span>
          <select
            value={values.order}
            onChange={(event) =>
              updateField("order", event.target.value === "oldest" ? "oldest" : "newest")
            }
            className="ommm-input h-10"
            aria-label={t("orderLabel")}
          >
            <option value="newest">{t("orderNewest")}</option>
            <option value="oldest">{t("orderOldest")}</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <OmmButton
          type="button"
          size="sm"
          variant={values.isActive === "active" ? "primary" : "ghost"}
          onClick={() =>
            updateField("isActive", values.isActive === "active" ? "all" : "active")
          }
        >
          {t("quickActive")}
        </OmmButton>
        <OmmButton
          type="button"
          size="sm"
          variant={values.isActive === "inactive" ? "primary" : "ghost"}
          onClick={() =>
            updateField("isActive", values.isActive === "inactive" ? "all" : "inactive")
          }
        >
          {t("quickInactive")}
        </OmmButton>
        <OmmButton type="button" size="sm" variant="subtle" onClick={resetFilters}>
          {t("clear")}
        </OmmButton>
        <p className="text-xs text-sage-500" role="status">
          {isPending ? t("loading") : t("activeCount", { count: activeFilterCount })}
        </p>
      </div>
    </div>
  );
}
