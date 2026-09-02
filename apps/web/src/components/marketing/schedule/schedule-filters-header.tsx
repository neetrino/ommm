"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import {
  ScheduleFilterDropdown,
  type ScheduleFilterOption,
} from "@/components/marketing/schedule/schedule-filter-dropdown";
import {
  SCHEDULE_MONTH_FILTERS_CONTROLS,
  SCHEDULE_MONTH_FILTERS_ROW,
  SCHEDULE_MONTH_LABEL,
} from "@/components/marketing/schedule/schedule-public-design";

const SCHEDULE_FILTERS_DESKTOP_MEDIA_QUERY = "(min-width: 640px)";

function subscribeScheduleFiltersDesktopLayout(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia(SCHEDULE_FILTERS_DESKTOP_MEDIA_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getScheduleFiltersDesktopLayoutSnapshot(): boolean {
  return window.matchMedia(SCHEDULE_FILTERS_DESKTOP_MEDIA_QUERY).matches;
}

/** Desktop row layout for schedule filters — matches `monthFiltersRow` breakpoint. */
function useScheduleFiltersDesktopLayout(): boolean {
  return useSyncExternalStore(
    subscribeScheduleFiltersDesktopLayout,
    getScheduleFiltersDesktopLayoutSnapshot,
    () => true,
  );
}

type ScheduleFiltersHeaderProps = {
  monthLabel: string;
  /** Desktop week board already shows the date range — hide month title. */
  hideMonthLabel?: boolean;
  filterClassType: string;
  filterInstructor: string;
  classTypeOptions: readonly ScheduleFilterOption<string>[];
  instructorOptions: readonly ScheduleFilterOption<string>[];
  onClassTypeChange: (v: string) => void;
  onInstructorChange: (v: string) => void;
};

export function ScheduleFiltersHeader({
  monthLabel,
  hideMonthLabel = false,
  filterClassType,
  filterInstructor,
  classTypeOptions,
  instructorOptions,
  onClassTypeChange,
  onInstructorChange,
}: ScheduleFiltersHeaderProps) {
  const t = useTranslations("marketingPages.schedule");
  const isDesktopFiltersLayout = useScheduleFiltersDesktopLayout();

  return (
    <div
      className={[
        SCHEDULE_MONTH_FILTERS_ROW,
        hideMonthLabel ? "justify-center" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {hideMonthLabel ? null : <p className={SCHEDULE_MONTH_LABEL}>{monthLabel}</p>}
      <div className={SCHEDULE_MONTH_FILTERS_CONTROLS}>
        <ScheduleFilterDropdown
          label={t("filterClassType")}
          ariaLabel={t("filterClassTypeAria")}
          value={filterClassType}
          options={classTypeOptions}
          onChange={onClassTypeChange}
          menuAlign={isDesktopFiltersLayout ? "end" : "start"}
        />
        <ScheduleFilterDropdown
          label={t("filterInstructor")}
          ariaLabel={t("filterInstructorAria")}
          value={filterInstructor}
          options={instructorOptions}
          onChange={onInstructorChange}
          menuAlign="end"
        />
      </div>
    </div>
  );
}
