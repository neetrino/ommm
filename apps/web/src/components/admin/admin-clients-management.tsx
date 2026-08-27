"use client";

import { useTranslations } from "next-intl";
import { AdminClientDrawer } from "@/components/admin/admin-client-drawer";
import { AdminClientsAddUserGlyph } from "@/components/admin/admin-clients-add-user-glyph";
import { AdminClientsSphereView } from "@/components/admin/admin-clients-sphere-view";
import { AdminClientsSummary } from "@/components/admin/admin-clients-summary";
import { AdminClientsTable } from "@/components/admin/admin-clients-table";
import { AdminClientsViewSwitcher } from "@/components/admin/admin-clients-view-switcher";
import { useAdminClientsFilterFields } from "@/components/admin/use-admin-clients-filter-fields";
import { useAdminClientsManagement } from "@/components/admin/use-admin-clients-management";
import { useAdminClientsView } from "@/components/admin/use-admin-clients-view";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { AdminPageHeroActionButton } from "@/components/admin/admin-page-hero-action-button";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { useIsMarketingPhoneViewport } from "@/hooks/use-is-marketing-phone-viewport";
import type { AdminClientsPayload, ClientRow } from "./admin-clients-types";
import {
  adminClientCapabilities,
  type ClientCapabilities,
} from "@/lib/backoffice-capabilities";

type AdminClientsManagementProps = {
  initial: AdminClientsPayload;
  locale: string;
  initialFilters: Record<string, string>;
  onAddUser?: () => void;
  onRegisterRefetch?: (refetch: () => void) => void;
  onRegisterSeedCreatedClient?: (seed: (client: ClientRow) => void) => void;
  variant?: "full" | "staff";
  staffBanner?: string;
  /** @deprecated Prefer `capabilities`. */
  readOnly?: boolean;
  capabilities?: ClientCapabilities;
};

function resolveClientCapabilities(
  capabilities: ClientCapabilities | undefined,
  readOnly: boolean,
): ClientCapabilities {
  if (capabilities) {
    return capabilities;
  }
  if (readOnly) {
    return {
      canView: true,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canAddNotes: false,
      canAssignPackage: false,
      canCreateBooking: false,
      canCancelBooking: false,
    };
  }
  return adminClientCapabilities();
}

export function AdminClientsManagement({
  initial,
  locale,
  initialFilters,
  onAddUser,
  onRegisterRefetch,
  onRegisterSeedCreatedClient,
  variant = "full",
  staffBanner,
  readOnly = false,
  capabilities,
}: AdminClientsManagementProps) {
  const caps = resolveClientCapabilities(capabilities, readOnly);
  const isStaff = variant === "staff";
  const t = useTranslations("adminPages.clients");
  const tFilters = useTranslations("adminPages.clients.filters");
  const isPhone = useIsMarketingPhoneViewport();
  const { viewMode, setViewMode } = useAdminClientsView();
  const effectiveViewMode = isPhone ? "list" : viewMode;

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
  } = useAdminClientsManagement({
    initial,
    initialFilters,
    onRegisterRefetch,
    onRegisterSeedCreatedClient,
  });

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

  const searchRow = (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      {searchFilters}
      <div className="hidden shrink-0 sm:block">
        <AdminClientsViewSwitcher value={viewMode} onChange={setViewMode} />
      </div>
    </div>
  );

  const addClientAction =
    onAddUser && caps.canCreate ? (
      <AdminPageHeroActionButton type="button" onClick={onAddUser}>
        <AdminClientsAddUserGlyph className="h-5 w-5 shrink-0" />
        {t("addUserButton")}
      </AdminPageHeroActionButton>
    ) : null;

  const clientsList = (
    <>
      <div className={loading ? "opacity-60 transition-opacity duration-150" : "transition-opacity duration-150"}>
        {effectiveViewMode === "sphere" ? (
          <AdminClientsSphereView rows={payload.rows} onSelect={selectClient} />
        ) : (
          <AdminClientsTable
            rows={payload.rows}
            onSelect={selectClient}
            onChanged={refetchClients}
            capabilities={caps}
            readOnly={!caps.canUpdate || isStaff}
          />
        )}
      </div>
      <OmmListPagination
        total={payload.pagination.total}
        page={listPage.page}
        pageSize={listPage.pageSize}
        offset={payload.pagination.offset}
        onPageChange={setListPage}
        disabled={loading}
      />
      {!loading && payload.rows.length === 0 ? (
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
          search={searchRow}
          primaryAction={addClientAction}
          metrics={<AdminClientsSummary payload={payload} />}
          status={error ? <div className="app-alert-warn">{error}</div> : null}
        >
          {clientsList}
        </StaffListPageLayout>
      ) : (
        <>
          <AdminPageHero
            title={t("title")}
            search={searchRow}
            primaryAction={addClientAction}
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
        capabilities={caps}
        allowPackagePurchase={caps.canAssignPackage && !isStaff}
        allowCreateBooking={caps.canCreateBooking && !isStaff}
        allowCancelBooking={caps.canCancelBooking && !isStaff}
      />
    </div>
  );
}
