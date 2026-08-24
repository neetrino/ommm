"use client";

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
      <p className={SCHEDULE_MONTH_LABEL}>{monthLabel}</p>
      <div className={SCHEDULE_MONTH_FILTERS_CONTROLS}>
        <ScheduleFilterDropdown
          label={t("filterClassType")}
          ariaLabel={t("filterClassTypeAria")}
          value={filterClassType}
          options={classTypeOptions}
          onChange={onClassTypeChange}
        />
        <ScheduleFilterDropdown
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
