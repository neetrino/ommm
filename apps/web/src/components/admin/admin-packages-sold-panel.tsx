"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminClientDrawerById } from "@/components/admin/admin-client-drawer-by-id";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { AdminPackagesSoldBoardCard } from "@/components/admin/admin-packages-sold-board-card";
import {
  buildSoldPackagesFilterFields,
  soldPackagePlanFilterOptions,
} from "@/components/admin/admin-packages-sold-filter-fields";
import { ADMIN_SOLD_PACKAGES_BOARD_GRID_CLASS } from "@/components/admin/admin-packages-sold-list-layout";
import { AdminPackagesSoldTotal } from "@/components/admin/admin-packages-sold-total";
import {
  ADMIN_PACKAGES_PATH,
  PACKAGES_SOLD_PLAN_ALL,
  type SoldPackageListPayload,
} from "@/components/admin/admin-packages-sold";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { useSoldPackagesUrlState } from "@/components/admin/use-sold-packages-url-state";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";

type AdminPackagesSoldPanelProps = {
  locale: string;
  initial: SoldPackageListPayload;
  initialQuery: string;
  initialPlanId: string;
  packagePlans: readonly AdminPackageRow[];
};

export function AdminPackagesSoldPanel({
  locale,
  initial,
  initialQuery,
  initialPlanId,
  packagePlans,
}: AdminPackagesSoldPanelProps) {
  const t = useTranslations("adminPages.packages.sold");
  const { search, setSearch, planId, setPlanId, listPage, setListPage, isPending, router } =
    useSoldPackagesUrlState(initialQuery, initialPlanId);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  return (
    <>
      <AdminPageHero
        title={t("title")}
        titleBackHref={ADMIN_PACKAGES_PATH}
        titleBackLabel={t("backToPackages")}
        search={
          <SoldPackagesSearch
            search={search}
            planId={planId}
            packagePlans={packagePlans}
            onSearchChange={setSearch}
            onPlanIdChange={setPlanId}
          />
        }
      />
      <AdminPackagesSoldTotal
        locale={locale}
        totalAmountCents={initial.totalAmountCents}
        totalCount={initial.total}
      />
      <SoldPackagesResults
        locale={locale}
        initial={initial}
        listPage={listPage}
        isPending={isPending}
        onPageChange={setListPage}
        onOpenClient={setSelectedClientId}
      />
      <AdminClientDrawerById
        clientId={selectedClientId}
        locale={locale}
        onClose={() => setSelectedClientId(null)}
        onChanged={() => router.refresh()}
      />
    </>
  );
}

function SoldPackagesSearch({
  search,
  planId,
  packagePlans,
  onSearchChange,
  onPlanIdChange,
}: {
  search: string;
  planId: string;
  packagePlans: readonly AdminPackageRow[];
  onSearchChange: (value: string) => void;
  onPlanIdChange: (value: string) => void;
}) {
  const t = useTranslations("adminPages.packages.sold");
  const planOptions = useMemo(() => soldPackagePlanFilterOptions(packagePlans), [packagePlans]);
  const fields = useMemo(
    () =>
      buildSoldPackagesFilterFields({
        labels: {
          package: t("filterPackage"),
          packageAll: t("filterPackageAll"),
          packageEmpty: t("filterPackageEmpty"),
        },
        planOptions,
      }),
    [planOptions, t],
  );

  return (
    <ListPageSearchFilters
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder={t("searchPlaceholder")}
      fields={fields}
      filterValues={{ planId }}
      onFilterChange={(key, value) => {
        if (key === "planId") {
          onPlanIdChange(value);
        }
      }}
      onClearAll={() => {
        onSearchChange("");
        onPlanIdChange(PACKAGES_SOLD_PLAN_ALL);
      }}
      resetLabel={t("reset")}
    />
  );
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
