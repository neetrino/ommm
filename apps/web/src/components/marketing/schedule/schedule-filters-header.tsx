"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  SCHEDULE_INK,
  SCHEDULE_MUTED,
} from "@/components/marketing/schedule/schedule-public-design";
import {
  ScheduleFilterDropdown,
  type ScheduleFilterOption,
} from "@/components/marketing/schedule/schedule-filter-dropdown";
import type {
  ScheduleClassTypeFilter,
  ScheduleInstructorFilter,
} from "@/components/marketing/schedule/schedule-sample-sessions";

type ScheduleFiltersHeaderProps = {
  filterClassType: ScheduleClassTypeFilter;
  filterInstructor: ScheduleInstructorFilter;
  onClassTypeChange: (v: ScheduleClassTypeFilter) => void;
  onInstructorChange: (v: ScheduleInstructorFilter) => void;
};

export function ScheduleFiltersHeader({
  filterClassType,
  filterInstructor,
  onClassTypeChange,
  onInstructorChange,
}: ScheduleFiltersHeaderProps) {
  const t = useTranslations("marketingPages.schedule");
  const classTypeOptions: readonly ScheduleFilterOption<ScheduleClassTypeFilter>[] = [
    { value: "all", label: t("filterClassType") },
    { value: "therapy", label: t("filterOptionClassTherapy") },
    { value: "mat", label: t("filterOptionClassMat") },
    { value: "reformer", label: t("filterOptionClassReformer") },
  ];
  const instructorOptions: readonly ScheduleFilterOption<ScheduleInstructorFilter>[] = [
    { value: "all", label: t("filterInstructor") },
    { value: "elena", label: t("filterOptionInstructorElena") },
    { value: "alex", label: t("filterOptionInstructorAlex") },
    { value: "frontDesk", label: t("filterOptionInstructorFrontDesk") },
  ];

  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <h1
          id="schedule-page-title"
          className={`font-serif text-[clamp(1.6rem,1.8vw+1rem,2.2rem)] italic font-semibold tracking-tight ${SCHEDULE_INK}`}
        >
          {t("pageTitle")}
        </h1>
        <Link
          href="/user/classes"
          className={`shrink-0 text-sm font-medium underline-offset-4 hover:underline sm:pt-1 ${SCHEDULE_MUTED}`}
        >
          {t("myAccount")}
        </Link>
      </div>
      <div className="grid w-full grid-cols-1 gap-3 gap-x-4 self-stretch sm:grid-cols-2">
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
    </header>
  );
}
