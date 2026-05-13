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
