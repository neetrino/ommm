"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { AnalyticsSectionId } from "@/components/admin/admin-analytics-module";
import type {
  AnalyticsBookingStatusFilter,
  AnalyticsQuickFilterOption,
  AnalyticsRangeDays,
  AnalyticsSortKey,
} from "@/components/admin/admin-analytics-types";
import {
  ANALYTICS_QUICK_FILTER_VALUES,
  parseAnalyticsQuickFilters,
  serializeAnalyticsQuickFilters,
} from "@/components/admin/admin-analytics-helpers";
import { AdminFilterResetButton } from "@/components/ui/admin-filter-reset-button";
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";
import { OmmFilterMultiSelect } from "@/components/ui/omm-filter-multi-select";

type AdminAnalyticsFiltersProps = {
  filterOptions: {
    classTypes: Array<{ id: string; name: string }>;
    coaches: Array<{ id: string; name: string }>;
  };
  section?: AnalyticsSectionId | null;
  compact?: boolean;
};

const QUICK_FILTER_LABEL_KEYS: Record<AnalyticsQuickFilterOption, string> = {
  today: "quickToday",
  week: "quickWeek",
  month: "quickMonth",
  last30: "quickLast30",
  topCoaches: "quickTopCoaches",
  popularClasses: "quickPopularClasses",
};

export function AdminAnalyticsFilters({
  filterOptions,
  section = null,
  compact = false,
}: AdminAnalyticsFiltersProps) {
  const t = useTranslations("adminPages.analytics.filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const values = useMemo(
    () => ({
      rangeDays: (Number(searchParams.get("rangeDays")) || 30) as AnalyticsRangeDays,
      coachId: searchParams.get("coachId") ?? "",
      classTypeId: searchParams.get("classTypeId") ?? "",
      bookingStatus: (searchParams.get("bookingStatus") ?? "") as AnalyticsBookingStatusFilter,
      sort: (searchParams.get("sort") ?? "revenue-desc") as AnalyticsSortKey,
      quickFilters: parseAnalyticsQuickFilters(searchParams.get("quick") ?? undefined),
    }),
    [searchParams],
  );

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value.length === 0) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const reset = () => {
    const view = searchParams.get("view");
    const params = new URLSearchParams();
    if (view) {
      params.set("view", view);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const rangeOptions = useMemo<readonly DropdownOption<`${AnalyticsRangeDays}`>[]>(
    () => [
      { value: "7", label: t("range7") },
      { value: "30", label: t("range30") },
      { value: "90", label: t("range90") },
    ],
    [t],
  );

  const coachOptions = useMemo<readonly DropdownOption<string>[]>(
    () => [
      { value: "", label: t("coachAll") },
      ...filterOptions.coaches.map((coach) => ({
        value: coach.id,
        label: coach.name,
      })),
    ],
    [filterOptions.coaches, t],
  );

  const classTypeOptions = useMemo<readonly DropdownOption<string>[]>(
    () => [
      { value: "", label: t("classTypeAll") },
      ...filterOptions.classTypes.map((classType) => ({
        value: classType.id,
        label: classType.name,
      })),
    ],
    [filterOptions.classTypes, t],
  );

  const sortOptions = useMemo<readonly DropdownOption<AnalyticsSortKey>[]>(
    () => [
      { value: "revenue-desc", label: t("sortRevenueDesc") },
      { value: "revenue-asc", label: t("sortRevenueAsc") },
      { value: "bookings-desc", label: t("sortBookingsDesc") },
      { value: "bookings-asc", label: t("sortBookingsAsc") },
      { value: "attendance-desc", label: t("sortAttendanceDesc") },
      { value: "attendance-asc", label: t("sortAttendanceAsc") },
      { value: "name-asc", label: t("sortNameAsc") },
    ],
    [t],
  );

  const quickFilterOptions = useMemo(
    () =>
      ANALYTICS_QUICK_FILTER_VALUES.map((value) => ({
        value,
        label: t(QUICK_FILTER_LABEL_KEYS[value]),
      })),
    [t],
  );

  const handleQuickFiltersChange = (selectedValues: string[]) => {
    const next = selectedValues as AnalyticsQuickFilterOption[];
    const params = new URLSearchParams(searchParams.toString());
    const serialized = serializeAnalyticsQuickFilters(next);

    if (serialized.length === 0) {
      params.delete("quick");
    } else {
      params.set("quick", serialized);
    }

    if (next.includes("topCoaches") || next.includes("popularClasses")) {
      params.set("sort", "bookings-desc");
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  const bookingStatusOptions = useMemo<
    readonly DropdownOption<AnalyticsBookingStatusFilter>[]
  >(
    () => [
      { value: "", label: t("bookingStatusAll") },
      { value: "BOOKED", label: t("bookingStatusBooked") },
      { value: "COMPLETED", label: t("bookingStatusCompleted") },
      { value: "CANCELLED", label: t("bookingStatusCancelled") },
      { value: "MISSED", label: t("bookingStatusMissed") },
    ],
    [t],
  );

  const showCoachFilter = section === "bookings" || section === "coaches";
  const showClassTypeFilter = section === "bookings";
  const showBookingStatusFilter = section === "bookings";

  const filterGrid = (
    <div className={`grid gap-3 ${compact ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-5"}`}>
      <label className="text-sm text-sage-700">
        <span className="mb-1 block text-xs text-sage-500">{t("rangeLabel")}</span>
        <DropdownSelect
          label={t("rangeLabel")}
          ariaLabel={t("rangeLabel")}
          value={String(values.rangeDays) as `${AnalyticsRangeDays}`}
          options={rangeOptions}
          onChange={(value) => update("rangeDays", value)}
        />
      </label>
      {showCoachFilter ? (
        <label className="text-sm text-sage-700">
          <span className="mb-1 block text-xs text-sage-500">{t("coachLabel")}</span>
          <DropdownSelect
            label={t("coachLabel")}
            ariaLabel={t("coachLabel")}
            value={values.coachId}
            options={coachOptions}
            onChange={(value) => update("coachId", value)}
          />
        </label>
      ) : null}
      {showClassTypeFilter ? (
        <label className="text-sm text-sage-700">
          <span className="mb-1 block text-xs text-sage-500">{t("classTypeLabel")}</span>
          <DropdownSelect
            label={t("classTypeLabel")}
            ariaLabel={t("classTypeLabel")}
            value={values.classTypeId}
            options={classTypeOptions}
            onChange={(value) => update("classTypeId", value)}
          />
        </label>
      ) : null}
      {showBookingStatusFilter ? (
        <label className="text-sm text-sage-700">
          <span className="mb-1 block text-xs text-sage-500">{t("bookingStatusLabel")}</span>
          <DropdownSelect
            label={t("bookingStatusLabel")}
            ariaLabel={t("bookingStatusLabel")}
            value={values.bookingStatus}
            options={bookingStatusOptions}
            onChange={(value) => update("bookingStatus", value)}
          />
        </label>
      ) : null}
      <label className="text-sm text-sage-700">
        <span className="mb-1 block text-xs text-sage-500">{t("sortLabel")}</span>
        <DropdownSelect
          label={t("sortLabel")}
          ariaLabel={t("sortLabel")}
          value={values.sort}
          options={sortOptions}
          onChange={(value) => update("sort", value)}
        />
      </label>
    </div>
  );

  if (compact) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="max-w-md">
          <OmmFilterMultiSelect
            variant="accent"
            wrapLabel
            ariaLabel={t("quickFilterLabel")}
            allLabel={t("allQuickFilters")}
            selectedValues={values.quickFilters}
            onChange={handleQuickFiltersChange}
            formatSelectedCount={(count) => t("selectedCount", { count })}
            options={quickFilterOptions}
          />
        </div>
        {filterGrid}
      </div>
    );
  }

  return (
    <section className="rounded-[20px] border border-white/60 bg-white/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-sage-900">{t("heading")}</p>
        <AdminFilterResetButton onClick={reset}>
          {t("reset")}
        </AdminFilterResetButton>
      </div>
      <div className="mt-3 max-w-md">
        <label className="text-sm text-sage-700">
          <span className="mb-1 block text-xs text-sage-500">{t("quickFilterLabel")}</span>
          <OmmFilterMultiSelect
            variant="accent"
            wrapLabel
            ariaLabel={t("quickFilterLabel")}
            allLabel={t("allQuickFilters")}
            selectedValues={values.quickFilters}
            onChange={handleQuickFiltersChange}
            formatSelectedCount={(count) => t("selectedCount", { count })}
            options={quickFilterOptions}
          />
        </label>
      </div>
      <div className="mt-3">{filterGrid}</div>
    </section>
  );
}
