"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminClientDrawerById } from "@/components/admin/admin-client-drawer-by-id";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { AdminPackagesSoldBoardCard } from "@/components/admin/admin-packages-sold-board-card";
import {
  buildSoldPackagesFilterFields,
  normalizeSoldPackagesDraftChange,
  planBelongsToSoldPackageCategory,
  soldPackageCategoryFilterOptions,
  soldPackagePlanFilterOptions,
} from "@/components/admin/admin-packages-sold-filter-fields";
import { ADMIN_SOLD_PACKAGES_BOARD_GRID_CLASS } from "@/components/admin/admin-packages-sold-list-layout";
import { AdminPackagesSoldTotal } from "@/components/admin/admin-packages-sold-total";
import {
  ADMIN_PACKAGES_PATH,
  PACKAGES_SOLD_CATEGORY_ALL,
  PACKAGES_SOLD_CATEGORY_QUERY_KEY,
  PACKAGES_SOLD_PLAN_ALL,
  PACKAGES_SOLD_PLAN_QUERY_KEY,
  parseSoldPackagesCategorySlugs,
  serializeSoldPackagesCategorySlugs,
  type SoldPackageListPayload,
} from "@/components/admin/admin-packages-sold";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { useSoldPackagesUrlState } from "@/components/admin/use-sold-packages-url-state";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { OmmFilterMultiSelect } from "@/components/ui/omm-filter-multi-select";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";

type AdminPackagesSoldPanelProps = {
  locale: string;
  initial: SoldPackageListPayload;
  initialQuery: string;
  initialPlanId: string;
  initialCategorySlug: string;
  packagePlans: readonly AdminPackageRow[];
};

export function AdminPackagesSoldPanel({
  locale,
  initial,
  initialQuery,
  initialPlanId,
  initialCategorySlug,
  packagePlans,
}: AdminPackagesSoldPanelProps) {
  const t = useTranslations("adminPages.packages.sold");
  const urlState = useSoldPackagesUrlState(initialQuery, initialPlanId, initialCategorySlug);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  return (
    <>
      <AdminPageHero
        title={t("title")}
        titleBackHref={ADMIN_PACKAGES_PATH}
        titleBackLabel={t("backToPackages")}
        search={<SoldPackagesSearch packagePlans={packagePlans} urlState={urlState} />}
      />
      <AdminPackagesSoldTotal
        locale={locale}
        totalAmountCents={initial.totalAmountCents}
        totalCount={initial.total}
      />
      <SoldPackagesResults
        locale={locale}
        initial={initial}
        listPage={urlState.listPage}
        isPending={urlState.isPending}
        onPageChange={urlState.setListPage}
        onOpenClient={setSelectedClientId}
      />
      <AdminClientDrawerById
        clientId={selectedClientId}
        locale={locale}
        onClose={() => setSelectedClientId(null)}
        onChanged={() => urlState.router.refresh()}
      />
    </>
  );
}

type SoldPackagesUrlState = ReturnType<typeof useSoldPackagesUrlState>;

function SoldPackagesSearch({
  packagePlans,
  urlState,
}: {
  packagePlans: readonly AdminPackageRow[];
  urlState: SoldPackagesUrlState;
}) {
  const t = useTranslations("adminPages.packages.sold");
  const labels = useSoldPackagesFilterLabels();
  const categoryOptions = useMemo(
    () => soldPackageCategoryFilterOptions(packagePlans),
    [packagePlans],
  );

  return (
    <ListPageSearchFilters
      search={urlState.search}
      onSearchChange={urlState.setSearch}
      searchPlaceholder={t("searchPlaceholder")}
      resolveFields={(values) =>
        buildSoldPackagesFilterFields({
          labels,
          categoryOptions,
          planOptions: soldPackagePlanFilterOptions(
            packagePlans,
            values[PACKAGES_SOLD_CATEGORY_QUERY_KEY] ?? PACKAGES_SOLD_CATEGORY_ALL,
          ),
          renderCategory: ({ value, onChange }) => (
            <OmmFilterMultiSelect
              ariaLabel={labels.category}
              allLabel={
                categoryOptions.length > 0 ? labels.categoryAll : labels.categoryEmpty
              }
              options={categoryOptions}
              selectedValues={parseSoldPackagesCategorySlugs(value)}
              onChange={(next) => onChange(serializeSoldPackagesCategorySlugs(next))}
              formatSelectedCount={labels.categorySelected}
            />
          ),
        })
      }
      filterValues={{ planId: urlState.planId, categorySlug: urlState.categorySlug }}
      normalizeDraftChange={(previous, key, value) =>
        normalizeSoldPackagesDraftChange(packagePlans, previous, key, value)
      }
      onFilterChange={(key, value) => applySoldFilterChange(urlState, packagePlans, key, value)}
      onClearAll={() => clearSoldFilters(urlState)}
      resetLabel={t("reset")}
    />
  );
}

function useSoldPackagesFilterLabels() {
  const t = useTranslations("adminPages.packages.sold");
  return useMemo(
    () => ({
      category: t("filterCategory"),
      categoryAll: t("filterCategoryAll"),
      categoryEmpty: t("filterCategoryEmpty"),
      categorySelected: (count: number) => t("filterCategorySelected", { count }),
      package: t("filterPackage"),
      packageAll: t("filterPackageAll"),
      packageEmpty: t("filterPackageEmpty"),
    }),
    [t],
  );
}

function applySoldFilterChange(
  urlState: SoldPackagesUrlState,
  packagePlans: readonly AdminPackageRow[],
  key: string,
  value: string,
): void {
  if (key === PACKAGES_SOLD_PLAN_QUERY_KEY) {
    urlState.setPlanId(value);
    return;
  }
  if (key !== PACKAGES_SOLD_CATEGORY_QUERY_KEY) {
    return;
  }
  urlState.setCategorySlug(value);
  if (!planBelongsToSoldPackageCategory(packagePlans, urlState.planId, value)) {
    urlState.setPlanId(PACKAGES_SOLD_PLAN_ALL);
  }
}

function clearSoldFilters(urlState: SoldPackagesUrlState): void {
  urlState.setSearch("");
  urlState.setPlanId(PACKAGES_SOLD_PLAN_ALL);
  urlState.setCategorySlug(PACKAGES_SOLD_CATEGORY_ALL);
}

function SoldPackagesResults({
  locale,
  initial,
  listPage,
  isPending,
  onPageChange,
  onOpenClient,
}: {
  locale: string;
  initial: SoldPackageListPayload;
  listPage: { page: number; pageSize: number };
  isPending: boolean;
  onPageChange: (page: number) => void;
  onOpenClient: (clientId: string) => void;
}) {
  const t = useTranslations("adminPages.packages.sold");

  return (
    <div className="mt-4">
      {initial.items.length === 0 ? (
        <p className="px-1 text-sm text-sage-500">{t("empty")}</p>
      ) : (
        <SoldPackagesBoard locale={locale} payload={initial} onOpenClient={onOpenClient} />
      )}
      {initial.total > 0 ? (
        <OmmListPagination
          total={initial.total}
          page={listPage.page}
          pageSize={listPage.pageSize}
          offset={initial.offset}
          onPageChange={onPageChange}
          disabled={isPending}
        />
      ) : null}
    </div>
  );
}

function SoldPackagesBoard({
  locale,
  payload,
  onOpenClient,
}: {
  locale: string;
  payload: SoldPackageListPayload;
  onOpenClient: (clientId: string) => void;
}) {
  return (
    <ul className={ADMIN_SOLD_PACKAGES_BOARD_GRID_CLASS}>
      {payload.items.map((row) => (
        <li key={row.id} className="min-w-0">
          <AdminPackagesSoldBoardCard
            locale={locale}
            row={row}
            onOpenClient={onOpenClient}
          />
        </li>
      ))}
    </ul>
  );
}
