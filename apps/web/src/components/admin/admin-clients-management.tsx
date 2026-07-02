"use client";

import { useTranslations } from "next-intl";
import { AdminClientDrawer } from "@/components/admin/admin-client-drawer";
import { AdminClientsAddUserGlyph } from "@/components/admin/admin-clients-add-user-glyph";
import { AdminClientsSummary } from "@/components/admin/admin-clients-summary";
import { AdminClientsTable } from "@/components/admin/admin-clients-table";
import { useAdminClientsFilterFields } from "@/components/admin/use-admin-clients-filter-fields";
import { useAdminClientsManagement } from "@/components/admin/use-admin-clients-management";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import type { AdminClientsPayload } from "./admin-clients-types";

type AdminClientsManagementProps = {
  initial: AdminClientsPayload;
  locale: string;
  initialFilters: Record<string, string>;
  onAddUser?: () => void;
  onRegisterRefetch?: (refetch: () => void) => void;
  variant?: "full" | "staff";
  staffBanner?: string;
  readOnly?: boolean;
};

export function AdminClientsManagement({
  initial,
  locale,
  initialFilters,
  onAddUser,
  onRegisterRefetch,
  variant = "full",
  staffBanner,
  readOnly = false,
}: AdminClientsManagementProps) {
  const isStaff = variant === "staff";
  const t = useTranslations("adminPages.clients");
  const tFilters = useTranslations("adminPages.clients.filters");

  const {
    payload,
    filters,
    loading,
    error,
    selected,
    listPage,
    integratedFilterValues,
    selectClient,
    closeClientView,
    setListPage,
    updateFilter,
    refetchClients,
    resetFilters,
    handleIntegratedFilterChange,
    handleClientChanged,
  } = useAdminClientsManagement({ initial, initialFilters, onRegisterRefetch });

  const filterFields = useAdminClientsFilterFields(payload);

  const searchFilters = (
    <ListPageSearchFilters
      search={filters.search}
      onSearchChange={(value) => updateFilter("search", value)}
      searchPlaceholder={tFilters("searchPlaceholder")}
      fields={filterFields}
      filterValues={integratedFilterValues}
      onFilterChange={handleIntegratedFilterChange}
      onClearAll={resetFilters}
      resetLabel={tFilters("resetFilters")}
    />
  );

  const clientsList = (
    <>
      <AdminClientsTable
        rows={payload.rows}
        onSelect={selectClient}
        onChanged={refetchClients}
        readOnly={readOnly || isStaff}
      />
      <OmmListPagination
        total={payload.pagination.total}
        page={listPage.page}
        pageSize={listPage.pageSize}
        offset={payload.pagination.offset}
        onPageChange={(nextPage) => setListPage(nextPage)}
        disabled={loading}
      />
      {payload.rows.length === 0 ? (
        <div className="rounded-2xl border border-white/60 bg-white/70 p-6 text-sm text-sage-600">
          {t("emptyList")}
        </div>
      ) : null}
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      {isStaff ? (
        <StaffListPageLayout
          title={t("title")}
          banner={staffBanner}
          search={searchFilters}
          metrics={<AdminClientsSummary payload={payload} />}
          status={error ? <div className="app-alert-warn">{error}</div> : null}
        >
          {clientsList}
        </StaffListPageLayout>
      ) : (
        <>
          <AdminPageHero
            title={t("title")}
            search={searchFilters}
            trailing={
              onAddUser && !readOnly ? (
                <OmmButton
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={onAddUser}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full"
                >
                  <AdminClientsAddUserGlyph className="h-5 w-5 shrink-0" />
                  {t("addUserButton")}
                </OmmButton>
              ) : null
            }
          />
          <AdminClientsSummary payload={payload} />
          {error ? <div className="app-alert-warn">{error}</div> : null}
          {clientsList}
        </>
      )}
      <AdminClientDrawer
        client={selected}
        locale={locale}
        onClose={closeClientView}
        onChanged={handleClientChanged}
      />
    </div>
  );
}
