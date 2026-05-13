"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  SCHEDULE_FILTER_SELECT,
  SCHEDULE_INK,
  SCHEDULE_MUTED,
} from "@/components/marketing/schedule/schedule-public-design";
import type {
  ScheduleClassTypeFilter,
  ScheduleInstructorFilter,
} from "@/components/marketing/schedule/schedule-sample-sessions";
import { ChevronDownIcon } from "@/components/marketing/schedule/schedule-view-icons";

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
          href="/user/home"
          className={`shrink-0 text-sm font-medium underline-offset-4 hover:underline sm:pt-1 ${SCHEDULE_MUTED}`}
        >
          {t("myAccount")}
        </Link>
      </div>
      <div className="grid w-full grid-cols-1 gap-3 gap-x-4 self-stretch sm:grid-cols-2">
        <div className="relative">
          <label htmlFor="schedule-class-type" className="sr-only">
            {t("filterClassTypeAria")}
          </label>
          <select
            id="schedule-class-type"
            value={filterClassType}
            onChange={(e) => onClassTypeChange(e.target.value as ScheduleClassTypeFilter)}
            className={SCHEDULE_FILTER_SELECT}
          >
            <option value="all">{t("filterClassType")}</option>
            <option value="therapy">{t("filterOptionClassTherapy")}</option>
            <option value="mat">{t("filterOptionClassMat")}</option>
            <option value="reformer">{t("filterOptionClassReformer")}</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <ChevronDownIcon />
          </span>
        </div>
        <div className="relative">
          <label htmlFor="schedule-instructor" className="sr-only">
            {t("filterInstructorAria")}
          </label>
          <select
            id="schedule-instructor"
            value={filterInstructor}
            onChange={(e) => onInstructorChange(e.target.value as ScheduleInstructorFilter)}
            className={SCHEDULE_FILTER_SELECT}
          >
            <option value="all">{t("filterInstructor")}</option>
            <option value="elena">{t("filterOptionInstructorElena")}</option>
            <option value="alex">{t("filterOptionInstructorAlex")}</option>
            <option value="frontDesk">{t("filterOptionInstructorFrontDesk")}</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <ChevronDownIcon />
          </span>
        </div>
      </div>
    </header>
  );
}
