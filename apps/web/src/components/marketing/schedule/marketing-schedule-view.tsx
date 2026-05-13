"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ScheduleDateControls } from "@/components/marketing/schedule/schedule-date-controls";
import { ScheduleFiltersHeader } from "@/components/marketing/schedule/schedule-filters-header";
import { ScheduleSessionRow } from "@/components/marketing/schedule/schedule-session-row";
import { SCHEDULE_MUTED } from "@/components/marketing/schedule/schedule-public-design";
import {
  addDays,
  compareTimeOfDay,
  isSameCalendarDay,
  startOfLocalDay,
} from "@/components/marketing/schedule/schedule-date-utils";
import {
  SCHEDULE_SAMPLE_SESSION_DEFS,
  type ScheduleClassTypeFilter,
  type ScheduleInstructorFilter,
} from "@/components/marketing/schedule/schedule-sample-sessions";

export function MarketingScheduleView() {
  const t = useTranslations("marketingPages.schedule");
  const locale = useLocale();
  const [baseline] = useState(() => startOfLocalDay(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => baseline);
  const [windowStart, setWindowStart] = useState(() => addDays(baseline, -3));
  const [classType, setClassType] = useState<ScheduleClassTypeFilter>("all");
  const [instructor, setInstructor] = useState<ScheduleInstructorFilter>("all");

  const visibleSessions = useMemo(() => {
    return SCHEDULE_SAMPLE_SESSION_DEFS.filter((def) => {
      const rowDay = addDays(baseline, def.dayOffset);
      if (!isSameCalendarDay(rowDay, selectedDate)) return false;
      if (classType !== "all" && def.classType !== classType) return false;
      if (instructor !== "all" && def.instructorKey !== instructor) return false;
      return true;
    }).sort((a, b) =>
      compareTimeOfDay(a.startHour, a.startMinute, b.startHour, b.startMinute),
    );
  }, [baseline, selectedDate, classType, instructor]);

  return (
    <div className="font-sans">
      <ScheduleFiltersHeader
        filterClassType={classType}
        filterInstructor={instructor}
        onClassTypeChange={setClassType}
        onInstructorChange={setInstructor}
      />
      <ScheduleDateControls
        locale={locale}
        selectedDate={selectedDate}
        windowStart={windowStart}
        onSelectDay={setSelectedDate}
        onShiftWindow={(delta) => setWindowStart((d) => addDays(d, delta))}
      />
      <ul className="mt-0 list-none p-0">
        {visibleSessions.length === 0 ? (
          <li className={`py-12 text-center text-sm ${SCHEDULE_MUTED}`}>{t("emptyDay")}</li>
        ) : (
          visibleSessions.map((row) => (
            <ScheduleSessionRow
              key={row.id}
              locale={locale}
              row={row}
              studioLabel={t("studioBrand")}
              bookLabel={t("bookCta")}
              title={t(`samples.${row.sampleSlug}.title`)}
              subtitle={t(`samples.${row.sampleSlug}.subtitle`)}
              durationLabel={t("minutesShort", { count: row.durationMinutes })}
            />
          ))
        )}
      </ul>
    </div>
  );
}
