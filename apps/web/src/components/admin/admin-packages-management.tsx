"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminAccordionPanel } from "@/components/admin/admin-accordion-panel";
import { AdminClassTypesModal, type AdminClassTypeRow } from "@/components/admin/admin-class-types-modal";
import { AdminPackageActions } from "@/components/admin/admin-package-actions";
import {
  AdminPackagesShell,
  PackagesAddButton,
} from "@/components/admin/admin-packages-shell";
import {
  countActivePackageFilters,
  filterPackages,
  formatPackageSessionsLabel,
  sortPackages,
} from "@/components/admin/admin-packages-filter-logic";
import { AdminPackagesFilters } from "@/components/admin/admin-packages-filters";
import { AdminPillTabs } from "@/components/admin/admin-pill-tabs";
import type { AdminPackageRow, PackageFilterValues } from "@/components/admin/admin-packages-types";
import {
  buildPackageFiltersQuery,
  PACKAGE_FILTER_QUERY_KEYS,
} from "@/components/admin/admin-packages-url";
import { formatAmdFromCents } from "@/lib/price-amd";

const ALL_TAB_ID = "all";
const MODAL_QUERY_KEY = "modal";
const MODAL_QUERY_VALUE = "add-package";
const SEARCH_DEBOUNCE_MS = 300;

type AdminPackagesManagementProps = {
  packages: readonly AdminPackageRow[];
  classTypes: readonly AdminClassTypeRow[];
  locale: string;
  initialFilters: PackageFilterValues;
};

export function AdminPackagesManagement({
  packages,
  classTypes,
  locale,
  initialFilters,
}: AdminPackagesManagementProps) {
  const t = useTranslations("adminPages.packages");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasMounted = useRef(false);
  const [filters, setFilters] = useState<PackageFilterValues>(initialFilters);
  const [activeTab, setActiveTab] = useState(ALL_TAB_ID);
  const [classTypesOpen, setClassTypesOpen] = useState(false);

  const filtered = useMemo(
    () => sortPackages(filterPackages(packages, filters), filters.order),
    [filters, packages],
  );

  const activeFilterCount = countActivePackageFilters(filters);

  const pillItems = useMemo(
    () => [
      { id: ALL_TAB_ID, label: t("tabAllPackages") },
      ...classTypes.map((type) => ({ id: type.id, label: type.name })),
    ],
    [classTypes, t],
  );

  const visibleClassTypes = useMemo(() => {
    if (activeTab === ALL_TAB_ID) {
      return classTypes;
    }
    return classTypes.filter((type) => type.id === activeTab);
  }, [activeTab, classTypes]);

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

  function openAddModal() {
    const params = new URLSearchParams(searchParams.toString());
    params.set(MODAL_QUERY_KEY, MODAL_QUERY_VALUE);
    router.replace(`${pathname}?${params.toString()}`);
  }

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

  const toolbar = (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <AdminPillTabs
        items={pillItems}
        activeId={activeTab}
        onChange={setActiveTab}
        ariaLabel={t("filters.status")}
      />
      <PackagesAddButton label={t("addPackageButton")} onClick={openAddModal} />
    </div>
  );

  return (
    <>
      <AdminPackagesShell toolbar={toolbar}>
        <AdminPackagesFilters
          values={filters}
          activeFilterCount={activeFilterCount}
          onChange={updateFilter}
          onReset={resetFilters}
        />

        {activeTab === ALL_TAB_ID ? (
          filtered.length === 0 ? (
            <p className="text-sm text-sage-500">{t("empty")}</p>
          ) : (
            <div className="flex flex-col gap-5">
              {filtered.map((pkg) => (
                <AdminAccordionPanel key={pkg.id} title={pkg.name} defaultOpen={false}>
                  <PackageDetails pkg={pkg} locale={locale} />
                </AdminAccordionPanel>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col gap-5">
            {visibleClassTypes.map((classType) => (
              <AdminAccordionPanel
                key={classType.id}
                title={classType.name}
                editLabel={t("editCategory")}
                onEdit={() => setClassTypesOpen(true)}
                emptyLabel={t("categoryEmpty")}
              />
            ))}
          </div>
        )}
      </AdminPackagesShell>

      <AdminClassTypesModal
        isOpen={classTypesOpen}
        classTypes={classTypes}
        sessionCountByTypeId={{}}
        onClose={() => setClassTypesOpen(false)}
        onChanged={() => {
          setClassTypesOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}

function PackageDetails({ pkg, locale }: { pkg: AdminPackageRow; locale: string }) {
  const t = useTranslations("adminPages.packages");
  const amount = formatAmdFromCents(pkg.priceCents, locale);
  const features = pkg.features.length > 0 ? pkg.features : [];
  const sessionsLabel = formatPackageSessionsLabel(pkg, {
    unlimited: t("sessionsUnlimited"),
    sessions: (count) => t("sessionsPerMonth", { count }),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
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
        <p className="break-words text-sm leading-relaxed text-sage-500">{pkg.description}</p>
      ) : null}

      <p className="font-serif text-3xl font-semibold tracking-tight text-sage-700">
        <span className="text-black">{amount.startsWith("֏") ? "֏" : ""}</span>
        {amount.startsWith("֏") ? amount.slice(1) : amount}
      </p>
      <p className="text-sm text-sage-500">
        {pkg.billingPeriod} · {pkg.periodDays} {t("daysLabel")}
      </p>
      <p className="text-sm text-sage-600">
        <span className="text-sage-500">{t("cardSessions")}: </span>
        {sessionsLabel}
      </p>

      {features.length > 0 ? (
        <ul className="space-y-2 text-sm text-sage-700">
          {features.map((feature) => (
            <li key={`${pkg.id}-${feature}`} className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-mint-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-sage-500">{t("noFeatures")}</p>
      )}

      <div className="border-t border-white/50 pt-4">
        <div className="mb-3 text-xs uppercase tracking-wide text-sage-500">
          {t("colOrder")}: {pkg.displayOrder}
        </div>
        <AdminPackageActions packageId={pkg.id} isActive={pkg.isActive} />
      </div>
    </div>
  );
}
