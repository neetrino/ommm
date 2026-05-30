"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminClassPackageDrawer } from "@/components/admin/admin-class-package-drawer";
import {
  AdminClassPackagesFilters,
  type ClassPackageFilterValues,
} from "@/components/admin/admin-class-packages-filters";
import {
  countActivePackageFilters,
  filterClassPackages,
  sortClassPackages,
} from "@/components/admin/admin-class-packages-filter-logic";
import { AdminClassPackagesShell } from "@/components/admin/admin-class-packages-shell";
import { enrichClassPackages } from "@/components/admin/admin-class-package-stats";
import type {
  AdminClassPackageCoachRow,
  AdminClassPackageSessionRow,
  AdminClassTypeRow,
  ClassPackageQuickFilter,
  ClassPackageSortOrder,
  EnrichedClassPackage,
} from "@/components/admin/admin-class-packages-types";
import { coachCardDisplayName } from "@/components/coaches/coach-card-display";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminClassPackagesManagementProps = {
  classTypes: readonly AdminClassTypeRow[];
  coaches: readonly AdminClassPackageCoachRow[];
  sessions: readonly AdminClassPackageSessionRow[];
  locale: string;
  initialFilters: Partial<ClassPackageFilterValues>;
};

const FILTER_QUERY_KEYS = ["search", "level", "coachId", "order", "quick"] as const;
const FILTER_DEBOUNCE_MS = 300;

function parseSortOrder(value: string | undefined): ClassPackageSortOrder {
  const allowed: ClassPackageSortOrder[] = [
    "newest",
    "oldest",
    "capacityHigh",
    "capacityLow",
    "priceHigh",
    "priceLow",
  ];
  return allowed.includes(value as ClassPackageSortOrder)
    ? (value as ClassPackageSortOrder)
    : "newest";
}

function parseQuick(value: string | undefined): ClassPackageQuickFilter {
  const allowed: ClassPackageQuickFilter[] = [
    "",
    "popular",
    "highCapacity",
    "lowCapacity",
    "beginner",
    "advanced",
    "withCoaches",
  ];
  return allowed.includes(value as ClassPackageQuickFilter)
    ? (value as ClassPackageQuickFilter)
    : "";
}

export function AdminClassPackagesManagement({
  classTypes,
  coaches,
  sessions,
  locale,
  initialFilters,
}: AdminClassPackagesManagementProps) {
  const t = useTranslations("adminPages.packages");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMounted = useRef(false);
  const [selected, setSelected] = useState<EnrichedClassPackage | null>(null);

  const [filters, setFilters] = useState<ClassPackageFilterValues>(() => ({
    search: initialFilters.search ?? "",
    level: initialFilters.level ?? "",
    coachId: initialFilters.coachId ?? "",
    order: parseSortOrder(initialFilters.order),
    quick: parseQuick(initialFilters.quick),
  }));

  const enriched = useMemo(
    () => enrichClassPackages(classTypes, coaches, sessions),
    [classTypes, coaches, sessions],
  );

  const filtered = useMemo(
    () => sortClassPackages(filterClassPackages(enriched, filters), filters.order),
    [enriched, filters],
  );

  const coachOptions = useMemo(
    () =>
      coaches.map((coach) => ({
        id: coach.id,
        label: coachCardDisplayName({
          name: coach.user.name,
          lastName: coach.user.lastName,
          email: coach.user.email,
          avatarUrl: null,
        }),
      })),
    [coaches],
  );

  const activeFilterCount = countActivePackageFilters(filters);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }
    const handle = window.setTimeout(() => {
      syncFiltersToUrl(filters);
    }, FILTER_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [filters]);

  function updateFilter<K extends keyof ClassPackageFilterValues>(
    key: K,
    value: ClassPackageFilterValues[K],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function resetFilters() {
    setFilters({
      search: "",
      level: "",
      coachId: "",
      order: "newest",
      quick: "",
    });
  }

  function syncFiltersToUrl(values: ClassPackageFilterValues) {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of FILTER_QUERY_KEYS) {
      params.delete(key);
    }
    if (values.search.trim()) params.set("search", values.search.trim());
    if (values.level.trim()) params.set("level", values.level.trim());
    if (values.coachId.trim()) params.set("coachId", values.coachId.trim());
    if (values.order !== "newest") params.set("order", values.order);
    if (values.quick) params.set("quick", values.quick);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function onPackageChanged() {
    router.refresh();
  }

  return (
    <AdminClassPackagesShell existingNames={classTypes.map((row) => row.name)}>
      <AdminClassPackagesFilters
        values={filters}
        coachOptions={coachOptions}
        activeFilterCount={activeFilterCount}
        onChange={updateFilter}
        onReset={resetFilters}
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-sage-500">{t("empty")}</p>
      ) : (
        <div className="grid items-stretch gap-5 md:grid-cols-2 xl:gap-6">
          {filtered.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              locale={locale}
              onOpen={() => setSelected(pkg)}
            />
          ))}
        </div>
      )}

      <AdminClassPackageDrawer
        pkg={selected}
        allCoaches={coaches}
        locale={locale}
        onClose={() => setSelected(null)}
        onChanged={onPackageChanged}
      />
    </AdminClassPackagesShell>
  );
}

function PackageCard({
  pkg,
  locale,
  onOpen,
}: {
  pkg: EnrichedClassPackage;
  locale: string;
  onOpen: () => void;
}) {
  const t = useTranslations("adminPages.packages");
  const stats = pkg.sessionStats;
  const price =
    stats.maxPriceCents !== null ? formatAmdFromCents(stats.maxPriceCents, locale) : null;

  return (
    <article className="ommm-card flex min-w-0 flex-col p-6 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-7">
      <button type="button" className="text-left" onClick={onOpen}>
        <h2 className="ommm-h3 break-words text-sage-800">{pkg.name}</h2>
        {pkg.description ? (
          <p className="mt-3 break-words text-sm leading-relaxed text-sage-500">
            {pkg.description}
          </p>
        ) : (
          <div className="mt-3 h-5" aria-hidden />
        )}

        <ul className="mt-5 space-y-2 text-sm text-sage-700">
          <li>
            <span className="text-sage-500">{t("cardSessions")}: </span>
            {stats.sessionCount > 0 ? stats.sessionCount : t("notAvailable")}
          </li>
          {stats.levels.length > 0 ? (
            <li>
              <span className="text-sage-500">{t("cardLevels")}: </span>
              {stats.levels.join(", ")}
            </li>
          ) : null}
          {stats.maxCapacity !== null ? (
            <li>
              <span className="text-sage-500">{t("cardCapacity")}: </span>
              {t("drawerCapacityRange", {
                min: stats.minCapacity ?? stats.maxCapacity,
                max: stats.maxCapacity,
              })}
            </li>
          ) : null}
          {price !== null ? (
            <li>
              <span className="text-sage-500">{t("cardPrice")}: </span>
              {price}
            </li>
          ) : null}
          <li>
            <span className="text-sage-500">{t("cardCoaches")}: </span>
            {pkg.assignedCoaches.length > 0
              ? pkg.assignedCoaches
                  .map((coach) =>
                    coachCardDisplayName({
                      name: coach.user.name,
                      lastName: coach.user.lastName,
                      email: coach.user.email,
                      avatarUrl: null,
                    }),
                  )
                  .join(", ")
              : t("notAvailable")}
          </li>
        </ul>
      </button>

      <div className="mt-6 border-t border-white/50 pt-4">
        <button
          type="button"
          className={`text-sm font-medium text-sand-800 underline-offset-2 hover:underline ${adminChrome.metaText}`}
          onClick={onOpen}
        >
          {t("viewDetails")}
        </button>
      </div>
    </article>
  );
}
