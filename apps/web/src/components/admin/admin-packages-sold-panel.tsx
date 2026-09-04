"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AdminClientDrawerById } from "@/components/admin/admin-client-drawer-by-id";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { AdminPackagesSoldCompactRow } from "@/components/admin/admin-packages-sold-compact-row";
import {
  ADMIN_SOLD_PACKAGES_LIST_EMPHASIZED_HEADER,
  ADMIN_SOLD_PACKAGES_LIST_HEADER_CELL,
  ADMIN_SOLD_PACKAGES_LIST_HEADER_CLASS,
  ADMIN_SOLD_PACKAGES_LIST_TABLE_CLASS,
} from "@/components/admin/admin-packages-sold-list-layout";
import {
  ADMIN_PACKAGES_PATH,
  type SoldPackageListPayload,
} from "@/components/admin/admin-packages-sold";
import { useSoldPackagesUrlState } from "@/components/admin/use-sold-packages-url-state";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";

type AdminPackagesSoldPanelProps = {
  locale: string;
  initial: SoldPackageListPayload;
  initialQuery: string;
};

export function AdminPackagesSoldPanel({
  locale,
  initial,
  initialQuery,
}: AdminPackagesSoldPanelProps) {
  const t = useTranslations("adminPages.packages.sold");
  const { search, setSearch, listPage, setListPage, isPending, router } =
    useSoldPackagesUrlState(initialQuery);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  return (
    <>
      <AdminPageHero
        title={t("title")}
        mobileBackHref={ADMIN_PACKAGES_PATH}
        mobileBackLabel={t("backToPackages")}
        search={
          <ListPageSearchFilters
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={t("searchPlaceholder")}
            onClearAll={() => setSearch("")}
            resetLabel={t("reset")}
          />
        }
      />
      {initial.items.length === 0 ? (
        <p className="px-1 text-sm text-sage-500">{t("empty")}</p>
      ) : (
        <SoldPackagesList locale={locale} payload={initial} onOpenClient={setSelectedClientId} />
      )}
      {initial.total > 0 ? (
        <OmmListPagination
          total={initial.total}
          page={listPage.page}
          pageSize={listPage.pageSize}
          offset={initial.offset}
          onPageChange={setListPage}
          disabled={isPending}
        />
      ) : null}
      <AdminClientDrawerById
        clientId={selectedClientId}
        locale={locale}
        onClose={() => setSelectedClientId(null)}
        onChanged={() => router.refresh()}
      />
    </>
  );
}

function SoldPackagesList({
  locale,
  payload,
  onOpenClient,
}: {
  locale: string;
  payload: SoldPackageListPayload;
  onOpenClient: (clientId: string) => void;
}) {
  const t = useTranslations("adminPages.packages.sold");
  const headerClass = `${ADMIN_SOLD_PACKAGES_LIST_HEADER_CELL} ${ADMIN_SOLD_PACKAGES_LIST_EMPHASIZED_HEADER}`;

  return (
    <div className={ADMIN_SOLD_PACKAGES_LIST_TABLE_CLASS}>
      <div className={ADMIN_SOLD_PACKAGES_LIST_HEADER_CLASS}>
        <div className={headerClass}>{t("columnClient")}</div>
        <div className={ADMIN_SOLD_PACKAGES_LIST_HEADER_CELL}>{t("columnPackage")}</div>
        <div className={ADMIN_SOLD_PACKAGES_LIST_HEADER_CELL}>{t("columnDate")}</div>
        <div className={ADMIN_SOLD_PACKAGES_LIST_HEADER_CELL}>{t("columnAmount")}</div>
      </div>
      {payload.items.map((row) => (
        <AdminPackagesSoldCompactRow
          key={row.id}
          locale={locale}
          row={row}
          onOpenClient={onOpenClient}
        />
      ))}
    </div>
  );
}
