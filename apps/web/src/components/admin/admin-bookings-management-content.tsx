"use client";

import type { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminBookingsMetric } from "@/components/admin/admin-bookings-metric";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { AdminBookingsViewSwitcher } from "@/components/admin/admin-bookings-view-switcher";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { ScheduleWeekColumnsView } from "@/components/shared/schedule/schedule-week-columns-view";
import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import type { ScheduleWeekMiniCardSession } from "@/components/shared/schedule/schedule-week-session-mini-card";
import type { BookingsView } from "@/components/admin/admin-bookings-view";
import { useSupportsListBoardView } from "@/hooks/use-supports-list-board-view";
import { scheduleTodayIsoDate } from "@/lib/local-iso-date";

type AdminBookingsManagementContentProps = {
  isStaff: boolean;
  view: BookingsView;
  locale: string;
  staffBanner?: string;
  statusMessage: string | null;
  filters: { search: string };
  bookingFilterFields: readonly AdminIntegratedFilterField[];
  integratedFilterValues: Record<string, string>;
  summary: { total: number; booked: number; waitlisted: number; today: number };
  weekRows: readonly ScheduleWeekMiniCardSession[];
  bookingsList: React.ReactNode;
  t: ReturnType<typeof useTranslations<"adminPages.bookings">>;
  tSchedule: ReturnType<typeof useTranslations<"adminPages.schedule">>;
  onFilterSearchChange: (value: string) => void;
  onFilterChange: (key: string, value: string) => void;
  onResetFilters: () => void;
  onViewChange: (view: BookingsView) => void;
  onWeekSessionClick: (sessionId: string) => void;
};

export function AdminBookingsManagementContent({
  isStaff,
  view,
  locale,
  staffBanner,
  statusMessage,
  filters,
  bookingFilterFields,
  integratedFilterValues,
  summary,
  weekRows,
  bookingsList,
  t,
  tSchedule,
  onFilterSearchChange,
  onFilterChange,
  onResetFilters,
  onViewChange,
  onWeekSessionClick,
}: AdminBookingsManagementContentProps) {
  /** Mobile-first — same gate as list data fetch (no week paint then swap to list). */
  const supportsDesktopViews = useSupportsListBoardView();
  const displayView: BookingsView = !supportsDesktopViews ? "list" : view;

  const metrics = (
    <div className={adminChrome.summaryGridFour}>
      <AdminBookingsMetric title={t("summaryTotal")} value={summary.total} />
      <AdminBookingsMetric title={t("summaryBooked")} value={summary.booked} />
      <AdminBookingsMetric title={t("summaryWaitlisted")} value={summary.waitlisted} />
      <AdminBookingsMetric title={t("summaryToday")} value={summary.today} />
    </div>
  );

  const searchFilters = (
    <ListPageSearchFilters
      search={filters.search}
      onSearchChange={onFilterSearchChange}
      searchPlaceholder={t("filterSearch")}
      fields={bookingFilterFields}
      filterValues={integratedFilterValues}
      onFilterChange={onFilterChange}
      onClearAll={onResetFilters}
      resetLabel={t("resetFilters")}
    />
  );

  if (isStaff) {
    return (
      <StaffListPageLayout
        title={t("title")}
        banner={staffBanner}
        search={searchFilters}
        metrics={metrics}
        status={
          statusMessage ? (
            <div className="rounded-xl border border-sand-500/30 bg-white/70 p-3 text-sm text-sage-900">
              {statusMessage}
            </div>
          ) : null
        }
      >
        {bookingsList}
      </StaffListPageLayout>
    );
  }

  return (
    <>
      <AdminPageHero
        title={t("title")}
        search={
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {searchFilters}
            <div className="max-[743px]:hidden shrink-0">
              <AdminBookingsViewSwitcher value={view} onChange={onViewChange} />
            </div>
          </div>
        }
      />
      {metrics}
      {statusMessage ? (
        <div className="rounded-xl border border-sand-500/30 bg-white/70 p-3 text-sm text-sage-900">
          {statusMessage}
        </div>
      ) : null}
      {displayView === "list" ? bookingsList : null}
      {displayView === "weekly" ? (
        <ScheduleWeekColumnsView
          locale={locale}
          rows={weekRows}
          showCoach
          cardVariant="staff"
          expandColumns={false}
          alignStartDayKey={scheduleTodayIsoDate()}
          onSessionClick={(session) => onWeekSessionClick(session.id)}
          labels={{
            gridAria: tSchedule("weekView.gridAria"),
            todayBadge: tSchedule("weekView.todayBadge"),
            emptyDay: tSchedule("weekView.emptyDay"),
          }}
        />
      ) : null}
    </>
  );
}
