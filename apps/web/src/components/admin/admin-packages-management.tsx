"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminPackageActions } from "@/components/admin/admin-package-actions";
import { AdminPackagesShell } from "@/components/admin/admin-packages-shell";
import {
  countActivePackageFilters,
  filterPackages,
  formatPackageSessionsLabel,
  sortPackages,
} from "@/components/admin/admin-packages-filter-logic";
import { AdminPackagesFilters } from "@/components/admin/admin-packages-filters";
import type { AdminPackageRow, PackageFilterValues } from "@/components/admin/admin-packages-types";
import {
  buildPackageFiltersQuery,
  PACKAGE_FILTER_QUERY_KEYS,
} from "@/components/admin/admin-packages-url";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminPackagesManagementProps = {
  packages: readonly AdminPackageRow[];
  locale: string;
  initialFilters: PackageFilterValues;
};

const SEARCH_DEBOUNCE_MS = 300;

export function AdminPackagesManagement({
  packages,
  locale,
  initialFilters,
}: AdminPackagesManagementProps) {
  const t = useTranslations("adminPages.packages");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMounted = useRef(false);
  const [filters, setFilters] = useState<PackageFilterValues>(initialFilters);

  const filtered = useMemo(
    () => sortPackages(filterPackages(packages, filters), filters.order),
    [filters, packages],
  );

  const activeFilterCount = countActivePackageFilters(filters);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }
    const handle = window.setTimeout(() => {
      syncFiltersToUrl(filters);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [filters.search]);

  function updateFilter<K extends keyof PackageFilterValues>(
    key: K,
    value: PackageFilterValues[K],
  ) {
    setFilters((current) => {
      const next = { ...current, [key]: value };
      if (key !== "search") {
        syncFiltersToUrl(next);
      }
      return next;
    });
  }

  function resetFilters() {
    const cleared: PackageFilterValues = {
      search: "",
      status: "all",
      order: "displayOrder",
    };
    setFilters(cleared);
    syncFiltersToUrl(cleared);
  }

  function syncFiltersToUrl(values: PackageFilterValues) {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of PACKAGE_FILTER_QUERY_KEYS) {
      params.delete(key);
    }
    const filterQuery = buildPackageFiltersQuery(values);
    if (filterQuery.length > 0) {
      for (const [key, entryValue] of new URLSearchParams(filterQuery)) {
        params.set(key, entryValue);
      }
    }
    const qs = params.toString();
    if (qs === searchParams.toString()) {
      return;
    }
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <AdminPackagesShell>
      <AdminPackagesFilters
        values={filters}
        activeFilterCount={activeFilterCount}
        onChange={updateFilter}
        onReset={resetFilters}
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-sage-500">{t("empty")}</p>
      ) : (
        <div className="grid items-stretch gap-5 md:grid-cols-2 xl:gap-6">
          {filtered.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} locale={locale} />
          ))}
        </div>
      )}
    </AdminPackagesShell>
  );
}

function PackageCard({ pkg, locale }: { pkg: AdminPackageRow; locale: string }) {
  const t = useTranslations("adminPages.packages");
  const amount = formatAmdFromCents(pkg.priceCents, locale);
  const features = pkg.features.length > 0 ? pkg.features : [];
  const sessionsLabel = formatPackageSessionsLabel(pkg, {
    unlimited: t("sessionsUnlimited"),
    sessions: (count) => t("sessionsPerMonth", { count }),
  });

  return (
    <article
      className={`ommm-card flex min-w-0 flex-col p-6 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-7 ${pkg.isPopular ? "ring-2 ring-sand-400/70" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="ommm-h3 break-words text-sage-800">{pkg.name}</h2>
        <div className="flex items-center gap-2">
          {pkg.isPopular ? (
            <span className="rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-sand-800">
              {t("popularBadge")}
            </span>
          ) : null}
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${pkg.isActive ? "bg-mint-100 text-mint-800" : "bg-sage-100 text-sage-700"}`}
          >
            {pkg.isActive ? t("statusActive") : t("statusInactive")}
          </span>
        </div>
      </div>

      {pkg.description ? (
        <p className="mt-3 break-words text-sm leading-relaxed text-sage-500">
          {pkg.description}
        </p>
      ) : (
        <div className="mt-3 h-5" aria-hidden />
      )}

      <p className="mt-6 font-serif text-3xl font-semibold tracking-tight text-sage-700">
        <span className="text-black">{amount.startsWith("֏") ? "֏" : ""}</span>
        {amount.startsWith("֏") ? amount.slice(1) : amount}
      </p>
      <p className="mt-2 text-sm text-sage-500">
        {pkg.billingPeriod} · {pkg.periodDays} {t("daysLabel")}
      </p>
      <p className="mt-1 text-sm text-sage-600">
        <span className="text-sage-500">{t("cardSessions")}: </span>
        {sessionsLabel}
      </p>

      {features.length > 0 ? (
        <ul className="mt-5 space-y-2 text-sm text-sage-700">
          {features.map((feature) => (
            <li key={`${pkg.id}-${feature}`} className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-mint-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-sage-500">{t("noFeatures")}</p>
      )}

      <div className="mt-8 border-t border-white/50 pt-5">
        <div className="mb-3 text-xs uppercase tracking-wide text-sage-500">
          {t("colOrder")}: {pkg.displayOrder}
        </div>
        <AdminPackageActions packageId={pkg.id} isActive={pkg.isActive} />
      </div>
    </article>
  );
}
