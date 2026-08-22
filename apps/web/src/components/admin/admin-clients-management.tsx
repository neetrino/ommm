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
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import type { AdminClientsPayload, ClientRow } from "./admin-clients-types";
import {
  adminClientCapabilities,
  type ClientCapabilities,
} from "@/lib/backoffice-capabilities";
import type { AdminClientsViewMode } from "@/lib/admin-clients-view-preference";

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
  const { viewMode, setViewMode } = useAdminClientsView();

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

  const heroActions = (
    <ClientsHeroActions
      viewMode={viewMode}
      onViewChange={setViewMode}
      onAddUser={onAddUser && caps.canCreate ? onAddUser : undefined}
      addLabel={t("addUserButton")}
    />
  );

  const clientsList = (
    <>
      <div className={loading ? "opacity-60 transition-opacity duration-150" : "transition-opacity duration-150"}>
        {viewMode === "sphere" ? (
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
          search={searchFilters}
          headerTrailing={
            <AdminClientsViewSwitcher value={viewMode} onChange={setViewMode} />
          }
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
            trailing={heroActions}
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

type ClientsHeroActionsProps = {
  viewMode: AdminClientsViewMode;
  onViewChange: (mode: AdminClientsViewMode) => void;
  onAddUser?: () => void;
  addLabel: string;
};

function ClientsHeroActions({
  viewMode,
  onViewChange,
  onAddUser,
  addLabel,
}: ClientsHeroActionsProps) {
  return (
    <>
      <AdminClientsViewSwitcher value={viewMode} onChange={onViewChange} />
      {onAddUser ? (
        <OmmButton
          type="button"
          variant="secondary"
          size="md"
          onClick={onAddUser}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full"
        >
          <AdminClientsAddUserGlyph className="h-5 w-5 shrink-0" />
          {addLabel}
        </OmmButton>
      ) : null}
    </>
  );
}
