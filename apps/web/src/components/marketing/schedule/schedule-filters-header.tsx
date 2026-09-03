"use client";

import { useTranslations } from "next-intl";
import {
  SCHEDULE_FILTER_ROOT,
  SCHEDULE_FILTER_TRIGGER,
  SCHEDULE_MONTH_FILTERS_CONTROLS,
  SCHEDULE_MONTH_FILTERS_ROW,
  SCHEDULE_MONTH_LABEL,
} from "@/components/marketing/schedule/schedule-public-design";
import { OmmFilterMultiSelect } from "@/components/ui/omm-filter-multi-select";

export type ScheduleFilterMultiOption = {
  value: string;
  label: string;
};

type ScheduleFiltersHeaderProps = {
  monthLabel: string;
  /** Desktop week board already shows the date range — hide month title. */
  hideMonthLabel?: boolean;
  classTypes: readonly string[];
  instructors: readonly string[];
  classTypeOptions: readonly ScheduleFilterMultiOption[];
  instructorOptions: readonly ScheduleFilterMultiOption[];
  onClassTypesChange: (values: string[]) => void;
  onInstructorsChange: (values: string[]) => void;
};

export function ScheduleFiltersHeader({
  monthLabel,
  hideMonthLabel = false,
  classTypes,
  instructors,
  classTypeOptions,
  instructorOptions,
  onClassTypesChange,
  onInstructorsChange,
}: ScheduleFiltersHeaderProps) {
  const t = useTranslations("marketingPages.schedule");

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
        <OmmFilterMultiSelect
          className={SCHEDULE_FILTER_ROOT}
          triggerClassName={SCHEDULE_FILTER_TRIGGER}
          ariaLabel={t("filterClassTypeAria")}
          allLabel={t("filterClassTypeAll")}
          options={classTypeOptions}
          selectedValues={classTypes}
          onChange={onClassTypesChange}
          formatSelectedCount={(count) => t("filterSelectedCount", { count })}
        />
        <OmmFilterMultiSelect
          className={SCHEDULE_FILTER_ROOT}
          triggerClassName={SCHEDULE_FILTER_TRIGGER}
          ariaLabel={t("filterInstructorAria")}
          allLabel={t("filterInstructorAll")}
          options={instructorOptions}
          selectedValues={instructors}
          onChange={onInstructorsChange}
          formatSelectedCount={(count) => t("filterSelectedCount", { count })}
        />
      </div>
    </div>
  );
}
