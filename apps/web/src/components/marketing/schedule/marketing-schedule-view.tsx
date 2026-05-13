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
  startOfWeekSunday,
} from "@/components/marketing/schedule/schedule-date-utils";
import {
  SCHEDULE_SAMPLE_SESSION_DEFS,
  type ScheduleClassTypeFilter,
  type ScheduleInstructorFilter,
} from "@/components/marketing/schedule/schedule-sample-sessions";

type ScheduleNavState = {
  windowStart: Date;
  selectedDate: Date;
};

function buildInitialNav(baseline: Date): ScheduleNavState {
  const windowStart = startOfWeekSunday(baseline);
  return { windowStart, selectedDate: baseline };
}

function shiftWeek(prev: ScheduleNavState, deltaDays: number): ScheduleNavState {
  const nextWs = addDays(prev.windowStart, deltaDays);
  const first = startOfLocalDay(nextWs);
  const last = addDays(first, 6);
  const sel = startOfLocalDay(prev.selectedDate);
  const outOfRange = sel.getTime() < first.getTime() || sel.getTime() > last.getTime();
  return {
    windowStart: nextWs,
    selectedDate: outOfRange ? first : prev.selectedDate,
  };
}

export function MarketingScheduleView() {
  const t = useTranslations("marketingPages.schedule");
  const locale = useLocale();
  const [baseline] = useState(() => startOfLocalDay(new Date()));
  const [nav, setNav] = useState<ScheduleNavState>(() => buildInitialNav(baseline));
  const [classType, setClassType] = useState<ScheduleClassTypeFilter>("all");
  const [instructor, setInstructor] = useState<ScheduleInstructorFilter>("all");

  const visibleSessions = useMemo(() => {
    return SCHEDULE_SAMPLE_SESSION_DEFS.filter((def) => {
      const rowDay = addDays(baseline, def.dayOffset);
      if (!isSameCalendarDay(rowDay, nav.selectedDate)) return false;
      if (classType !== "all" && def.classType !== classType) return false;
      if (instructor !== "all" && def.instructorKey !== instructor) return false;
      return true;
    }).sort((a, b) =>
      compareTimeOfDay(a.startHour, a.startMinute, b.startHour, b.startMinute),
    );
  }, [baseline, nav.selectedDate, classType, instructor]);

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
        selectedDate={nav.selectedDate}
        windowStart={nav.windowStart}
        onSelectDay={(d) => setNav((s) => ({ ...s, selectedDate: d }))}
        onShiftWindow={(delta) => setNav((s) => shiftWeek(s, delta))}
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
