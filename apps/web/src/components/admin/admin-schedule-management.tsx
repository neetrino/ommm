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
import { mapAdminScheduleSessionToListRow } from "@/lib/map-admin-session-to-list-row";
import { scheduleSessionLocalIsoDay } from "@/lib/local-iso-date";

export type { ScheduleView } from "@/components/admin/admin-schedule-view";
export type {
  AdminScheduleClassType,
  AdminScheduleCoach,
  AdminScheduleSession,
} from "@/components/admin/admin-schedule-session.types";

export function AdminScheduleManagement(props: AdminScheduleManagementProps) {
  const { locale, staffBanner } = props;
  const tPage = useTranslations("adminPages.schedule");
  const schedule = useAdminScheduleManagement(props);

  if (schedule.isStaff) {
    const staffRows = schedule.displayRows.map(mapAdminScheduleSessionToListRow);
    return (
      <div className="space-y-5">
        <StaffListPageLayout
          title={tPage("title")}
          banner={staffBanner}
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
          searchTrailing={
            <ScheduleViewSwitcher value={schedule.view} onChange={schedule.setView} />
          }
          metrics={<SummaryGrid summary={schedule.summary} />}
        >
          <StaffScheduleListWeekViews
            locale={locale}
            view={schedule.view}
            rows={staffRows}
            preset="staffWithCoach"
            showCoachInWeek
            emptyTitle={schedule.t("empty.filteredTitle")}
            emptyBody={schedule.t("empty.filteredBody")}
          />
          {schedule.view === "list" &&
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
        search={
          <div className="flex min-w-0 flex-1 items-center gap-2">
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
            <ScheduleViewSwitcher value={schedule.view} onChange={schedule.setView} />
          </div>
        }
        trailing={
          <OmmButton
            type="button"
            variant="secondary"
            size="md"
            onClick={schedule.openAddClassModal}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full"
          >
            <PlusIcon className="h-5 w-5 shrink-0" />
            {schedule.t("addClassButton")}
          </OmmButton>
        }
      />
      <SummaryGrid summary={schedule.summary} />
      {schedule.toast ? <AdminScheduleManagementToast toast={schedule.toast} /> : null}
      <ScheduleViews
        locale={locale}
        view={schedule.view}
        rows={schedule.displayRows}
        sortOrder={schedule.filters.order}
        onDateTimeSort={schedule.handleDateTimeSort}
        selectedDay={schedule.selectedDay}
        onSelectDay={schedule.handleSelectDay}
        onShowAllDays={schedule.handleShowAllDays}
        onDetails={schedule.setDetails}
        busyId={schedule.busyId}
        onCancel={schedule.handleCancel}
        onActivate={schedule.handleActivate}
        onDelete={schedule.handleDelete}
        onDuplicate={schedule.handleDuplicate}
      />
      {schedule.view === "list" &&
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
      {schedule.sessionModalConfig ? (
        <SessionFormSheet
          key={
            schedule.addClassOpen
              ? `create-${schedule.selectedDay ?? "default"}`
              : `${schedule.sessionModalConfig.mode}-${schedule.sessionModalConfig.row?.id ?? "new"}`
          }
          isOpen
          mode={schedule.sessionModalConfig.mode}
          row={schedule.sessionModalConfig.row}
          anchorDay={
            schedule.addClassOpen
              ? schedule.selectedDay
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
        onSaved={schedule.handleDetailsSaved}
        onDuplicate={schedule.handleDuplicateFromDetails}
        onDelete={schedule.handleDeleteFromDetails}
      />
    </div>
  );
}
