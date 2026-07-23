"use client";

import { useTranslations } from "next-intl";
import {
  ScheduleFilterDropdown,
  type ScheduleFilterOption,
} from "@/components/marketing/schedule/schedule-filter-dropdown";

type ScheduleFiltersHeaderProps = {
  filterClassType: string;
  filterInstructor: string;
  classTypeOptions: readonly ScheduleFilterOption<string>[];
  instructorOptions: readonly ScheduleFilterOption<string>[];
  onClassTypeChange: (v: string) => void;
  onInstructorChange: (v: string) => void;
};

export function ScheduleFiltersHeader({
  filterClassType,
  filterInstructor,
  classTypeOptions,
  instructorOptions,
  onClassTypeChange,
  onInstructorChange,
}: ScheduleFiltersHeaderProps) {
  const t = useTranslations("marketingPages.schedule");

  return (
    <div className="grid w-full grid-cols-1 gap-4 gap-x-5 self-stretch sm:grid-cols-2">
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
  );
}
