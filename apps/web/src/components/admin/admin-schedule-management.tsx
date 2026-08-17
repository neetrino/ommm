"use client";

import { useTranslations } from "next-intl";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { AdminScheduleManagementToast } from "@/components/admin/admin-schedule-management-toast";
import { AdminScheduleSessionDetailsSheet } from "@/components/admin/admin-schedule-session-details-sheet";
import { SessionFormSheet } from "@/components/admin/admin-schedule-session-form-sheet";
import { ScheduleViews } from "@/components/admin/admin-schedule-session-views";
import type { AdminScheduleManagementProps } from "@/components/admin/admin-schedule-session.types";
import { SummaryGrid } from "@/components/admin/admin-schedule-summary-grid";
import { useAdminScheduleManagement } from "@/components/admin/use-admin-schedule-management";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { ScheduleViewSwitcher } from "@/components/shared/schedule/schedule-view-switcher";
import { StaffScheduleListWeekViews } from "@/components/shared/schedule/staff-schedule-list-week-views";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { PlusIcon } from "@/components/ui/plus-icon";
import { useEffectiveScheduleView } from "@/hooks/use-effective-schedule-view";
import { mapAdminScheduleSessionToListRow } from "@/lib/map-admin-session-to-list-row";
import { scheduleSessionLocalIsoDay, scheduleTodayIsoDate } from "@/lib/local-iso-date";
import {
  adminScheduleCapabilities,
  type ScheduleCapabilities,
} from "@/lib/backoffice-capabilities";

export type { ScheduleView } from "@/components/admin/admin-schedule-view";
export type {
  AdminScheduleClassType,
  AdminScheduleCoach,
  AdminScheduleSession,
} from "@/components/admin/admin-schedule-session.types";

function resolveScheduleCapabilities(
  capabilities: ScheduleCapabilities | undefined,
): ScheduleCapabilities {
  return capabilities ?? adminScheduleCapabilities();
}

export function AdminScheduleManagement(props: AdminScheduleManagementProps) {
  const { locale, staffBanner } = props;
  const caps = resolveScheduleCapabilities(props.capabilities);
  const tPage = useTranslations("adminPages.schedule");
  const schedule = useAdminScheduleManagement(props);
  const view = useEffectiveScheduleView(schedule.view);

  if (schedule.isStaff) {
    const staffRows = schedule.displayRows.map(mapAdminScheduleSessionToListRow);
    return (
      <div className="space-y-5">
        <StaffListPageLayout
          title={tPage("title")}
          banner={staffBanner}
          sticky={false}
          search={
            <ListPageSearchFilters
              search={schedule.searchDraft}
              onSearchChange={schedule.setSearchDraft}
              searchPlaceholder={schedule.t("filters.searchPlaceholder")}
              fields={schedule.filterFields}
              filterValues={schedule.integratedFilterValues}
              onFilterChange={schedule.handleIntegratedFilterChange}
              onClearAll={schedule.resetFilters}
              resetLabel={schedule.t("filters.reset")}
            />
          }
          metrics={
            <div className="space-y-3">
              <SummaryGrid summary={schedule.summary} />
              <ScheduleViewSwitcher value={schedule.view} onChange={schedule.setView} />
            </div>
          }
        >
          <StaffScheduleListWeekViews
            locale={locale}
            view={view}
            rows={staffRows}
            preset="staffWithCoach"
            showCoachInWeek
            emptyTitle={schedule.t("empty.filteredTitle")}
            emptyBody={schedule.t("empty.filteredBody")}
            dateStripRows={schedule.dateStripRows}
            dateStripTotalCount={schedule.dateStripTotalCount}
            selectedStripDay={schedule.selectedStripDay}
            onSelectStripDay={schedule.handleSelectStripDay}
            onSelectAllStripDays={schedule.handleSelectAllStripDays}
          />
          {(view === "list" || view === "monthly") &&
          schedule.listPagination !== null &&
          schedule.listPagination.total > 0 ? (
            <OmmListPagination
              total={schedule.listPagination.total}
              page={schedule.listPage.page}
              pageSize={schedule.listPage.pageSize}
              offset={schedule.listPagination.offset}
              onPageChange={schedule.setListPage}
              disabled={schedule.busyId !== null}
            />
          ) : null}
        </StaffListPageLayout>
        {schedule.toast ? <AdminScheduleManagementToast toast={schedule.toast} /> : null}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <AdminPageHero
        title={tPage("title")}
        sticky={false}
        search={
          <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <ListPageSearchFilters
                search={schedule.searchDraft}
                onSearchChange={schedule.setSearchDraft}
                searchPlaceholder={schedule.t("filters.searchPlaceholder")}
                fields={schedule.filterFields}
                filterValues={schedule.integratedFilterValues}
                onFilterChange={schedule.handleIntegratedFilterChange}
                onClearAll={schedule.resetFilters}
                resetLabel={schedule.t("filters.reset")}
              />
            </div>
            {caps.canCreate ? (
              <OmmButton
                type="button"
                variant="secondary"
                size="md"
                onClick={schedule.openAddClassModal}
                className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full sm:w-auto"
              >
                <PlusIcon className="h-5 w-5 shrink-0" />
                {schedule.t("addClassButton")}
              </OmmButton>
            ) : null}
          </div>
        }
      />
      <div className="space-y-3">
        <SummaryGrid summary={schedule.summary} />
        <ScheduleViewSwitcher value={schedule.view} onChange={schedule.setView} />
      </div>
      {schedule.toast ? <AdminScheduleManagementToast toast={schedule.toast} /> : null}
      <ScheduleViews
        locale={locale}
        view={view}
        rows={schedule.displayRows}
        dateStripRows={schedule.dateStripRows}
        dateStripTotalCount={schedule.dateStripTotalCount}
        selectedStripDay={schedule.selectedStripDay}
        onSelectStripDay={schedule.handleSelectStripDay}
        onSelectAllStripDays={schedule.handleSelectAllStripDays}
        sortOrder={schedule.filters.order}
        onDateTimeSort={schedule.handleDateTimeSort}
        onDetails={schedule.setDetails}
        busyId={schedule.busyId}
        onCancel={caps.canCancel ? schedule.handleCancel : undefined}
        onActivate={caps.canChangeStatus ? schedule.handleActivate : undefined}
        onDelete={caps.canDelete ? schedule.handleDelete : undefined}
        onDuplicate={caps.canDuplicate ? schedule.handleDuplicate : undefined}
        selectionEnabled={caps.canCancel || caps.canChangeStatus}
        selectedIds={schedule.selectedIds}
        onToggleSelect={schedule.toggleSelect}
        onToggleSelectAll={schedule.toggleSelectAll}
        onBulkCancel={caps.canCancel ? schedule.handleBulkCancel : undefined}
        onBulkActivate={caps.canChangeStatus ? schedule.handleBulkActivate : undefined}
      />
      {(view === "list" || view === "monthly") &&
      schedule.listPagination !== null &&
      schedule.listPagination.total > 0 ? (
        <OmmListPagination
          total={schedule.listPagination.total}
          page={schedule.listPage.page}
          pageSize={schedule.listPage.pageSize}
          offset={schedule.listPagination.offset}
          onPageChange={schedule.setListPage}
          disabled={schedule.busyId !== null}
        />
      ) : null}
      {schedule.sessionModalConfig && (caps.canCreate || caps.canUpdate || caps.canDuplicate) ? (
        <SessionFormSheet
          key={
            schedule.addClassOpen
              ? `create-${scheduleTodayIsoDate()}`
              : `${schedule.sessionModalConfig.mode}-${schedule.sessionModalConfig.row?.id ?? "new"}`
          }
          isOpen
          mode={schedule.sessionModalConfig.mode}
          row={schedule.sessionModalConfig.row}
          anchorDay={
            schedule.addClassOpen
              ? scheduleTodayIsoDate()
              : schedule.sessionModalConfig.mode === "duplicate" && schedule.sessionModalConfig.row
                ? scheduleSessionLocalIsoDay(schedule.sessionModalConfig.row.startsAt)
                : null
          }
          classTypeOptions={schedule.sessionClassTypeOptions}
          coaches={schedule.coaches}
          onClose={schedule.handleFormClose}
          onSaved={schedule.handleFormSaved}
        />
      ) : null}
      <AdminScheduleSessionDetailsSheet
        locale={locale}
        row={schedule.details}
        classTypeOptions={schedule.sessionClassTypeOptions}
        coaches={schedule.coaches}
        actionBusy={schedule.busyId !== null && schedule.details !== null && schedule.busyId === schedule.details.id}
        onClose={() => schedule.setDetails(null)}
        onSaved={caps.canUpdate ? schedule.handleDetailsSaved : undefined}
        onDuplicate={caps.canDuplicate ? schedule.handleDuplicateFromDetails : undefined}
        onDelete={caps.canDelete ? schedule.handleDeleteFromDetails : undefined}
        capabilities={caps}
      />
    </div>
  );
}
