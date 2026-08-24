"use client";

import { useTranslations } from "next-intl";
import {
  ScheduleFilterDropdown,
  type ScheduleFilterOption,
} from "@/components/marketing/schedule/schedule-filter-dropdown";
import {
  SCHEDULE_MONTH_FILTERS_ROW,
  SCHEDULE_MONTH_LABEL,
} from "@/components/marketing/schedule/schedule-public-design";

type ScheduleFiltersHeaderProps = {
  monthLabel: string;
  filterClassType: string;
  filterInstructor: string;
  classTypeOptions: readonly ScheduleFilterOption<string>[];
  instructorOptions: readonly ScheduleFilterOption<string>[];
  onClassTypeChange: (v: string) => void;
  onInstructorChange: (v: string) => void;
};

export function ScheduleFiltersHeader({
  monthLabel,
  filterClassType,
  filterInstructor,
  classTypeOptions,
  instructorOptions,
  onClassTypeChange,
  onInstructorChange,
}: ScheduleFiltersHeaderProps) {
  const t = useTranslations("marketingPages.schedule");

  return (
    <div className={SCHEDULE_MONTH_FILTERS_ROW}>
      <p className={`${SCHEDULE_MONTH_LABEL} shrink-0`}>{monthLabel}</p>
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:flex-nowrap sm:gap-3">
        <ScheduleFilterDropdown
          className="w-auto shrink-0"
          label={t("filterClassType")}
          ariaLabel={t("filterClassTypeAria")}
          value={filterClassType}
          options={classTypeOptions}
          onChange={onClassTypeChange}
        />
        <ScheduleFilterDropdown
          className="w-auto shrink-0"
          label={t("filterInstructor")}
          ariaLabel={t("filterInstructorAria")}
          value={filterInstructor}
          options={instructorOptions}
          onChange={onInstructorChange}
        />
      </div>
    </div>
  );
}
