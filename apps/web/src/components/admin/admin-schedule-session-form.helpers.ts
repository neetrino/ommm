import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { buildCoachDropdownState } from "@/components/admin/admin-schedule-coach-filter";
import {
  DEFAULT_SESSION_CAPACITY,
  LEGACY_EDIT_CLASS_TYPE_QUERY_KEY,
  SCHEDULE_MODAL_QUERY_KEY,
  SCHEDULE_WEEKDAYS,
  SESSION_LEVEL_SEPARATOR,
} from "@/components/admin/admin-schedule-management.constants";
import type { SessionClassTypeOption } from "@/components/admin/admin-schedule-session-class-type-resolve";
import { coachName, splitSessionLevels } from "@/components/admin/admin-schedule-session.helpers";
import type {
  AdminScheduleCoach,
  AdminScheduleFormState,
  AdminScheduleSession,
  CalendarScheduleSlot,
  ScheduleDayOfWeek,
} from "@/components/admin/admin-schedule-session.types";
import { normalizeTimeInputValue } from "@/lib/date-display";
import { localIsoDateFromValue } from "@/lib/local-iso-date";
import {
  STUDIO_TIMEZONE_OFFSET_MINUTES,
  studioWallClockToUtc,
  utcToStudioCalendarDate,
  utcToStudioDayOfWeek,
  utcToStudioWallClockTime,
} from "@/lib/studio-timezone";

function timeValue(value: Date | string): string {
  return utcToStudioWallClockTime(new Date(value));
}

function addDays(value: Date | string, days: number): Date {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

export function createScheduleSlotId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `slot-${Date.now()}-${Math.random()}`;
}

export function weekdayFromDate(value: Date | string): ScheduleDayOfWeek {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return utcToStudioDayOfWeek(studioWallClockToUtc(value.trim(), "12:00"));
  }
  return utcToStudioDayOfWeek(new Date(value));
}

/** Next calendar day in Mon→Sun order (Sunday wraps to Monday). */
export function nextScheduleWeekday(weekday: ScheduleDayOfWeek): ScheduleDayOfWeek {
  const index = SCHEDULE_WEEKDAYS.indexOf(weekday);
  if (index === -1) {
    return weekday;
  }
  return SCHEDULE_WEEKDAYS[(index + 1) % SCHEDULE_WEEKDAYS.length];
}

/** All seven weekdays starting from the anchor date's day of week. */
export function scheduleWeekdaysFromDate(value: Date | string): readonly ScheduleDayOfWeek[] {
  const anchor = weekdayFromDate(value);
  const index = SCHEDULE_WEEKDAYS.indexOf(anchor);
  if (index === -1) {
    return SCHEDULE_WEEKDAYS;
  }
  return [...SCHEDULE_WEEKDAYS.slice(index), ...SCHEDULE_WEEKDAYS.slice(0, index)];
}

export function joinSessionLevels(levels: readonly string[]): string | undefined {
  const uniqueLevels = Array.from(new Set(levels.map((value) => value.trim()).filter(Boolean)));
  return uniqueLevels.length > 0 ? uniqueLevels.join(SESSION_LEVEL_SEPARATOR) : undefined;
}

export function initialCalendarSlot(
  form: AdminScheduleFormState,
  anchorDay?: string | null,
): CalendarScheduleSlot {
  const day = anchorDay ?? form.date;
  return {
    id: createScheduleSlotId(),
    weekday: weekdayFromDate(`${day}T00:00:00`),
    startTime: form.startTime,
    endTime: form.endTime,
  };
}

export function initialCalendarSchedule(
  form: AdminScheduleFormState,
  anchorDay?: string | null,
): {
  calendarStartDate: string;
  calendarEndDate: string;
  calendarSlots: CalendarScheduleSlot[];
} {
  const startDay = anchorDay ?? form.date;
  const endDay =
    anchorDay ?? localIsoDateFromValue(addDays(`${form.date}T00:00:00`, 29));
  return {
    calendarStartDate: startDay,
    calendarEndDate: endDay,
    calendarSlots: [initialCalendarSlot(form, anchorDay)],
  };
}

export function initialForm(
  classTypeOptions: readonly SessionClassTypeOption[],
  coaches: readonly AdminScheduleCoach[],
  row?: AdminScheduleSession,
): AdminScheduleFormState {
  const start = row ? new Date(row.startsAt) : new Date();
  const end = row ? new Date(row.endsAt) : new Date(start.getTime() + 60 * 60000);
  const classTypeId = row?.classType.id ?? "";
  const coachDropdown = buildCoachDropdownState(
    coaches,
    classTypeId,
    classTypeOptions,
    row?.coach.id ?? "",
    coachName,
  );
  return {
    description: row?.description ?? "",
    classTypeId,
    coachId: coachDropdown.coachId,
    date: row ? utcToStudioCalendarDate(start) : localIsoDateFromValue(start),
    startTime: timeValue(start),
    endTime: timeValue(end),
    capacity: row ? String(row.capacity) : DEFAULT_SESSION_CAPACITY,
    levels: splitSessionLevels(row?.level),
    status: row?.status ?? "ACTIVE",
  };
}

export function formPayload(form: AdminScheduleFormState, classTypeId: string, title: string) {
  const startTime = normalizeTimeInputValue(form.startTime);
  const endTime = normalizeTimeInputValue(form.endTime);
  return {
    title: title.trim(),
    description: form.description.trim() || undefined,
    classTypeId,
    coachId: form.coachId,
    startsAt: studioWallClockToUtc(form.date, startTime).toISOString(),
    endsAt: studioWallClockToUtc(form.date, endTime).toISOString(),
    capacity: Number(form.capacity),
    level: joinSessionLevels(form.levels),
    status: form.status,
  };
}

export function batchFormPayload(
  form: AdminScheduleFormState,
  classTypeId: string,
  title: string,
  startDate: string,
  endDate: string,
  slots: readonly CalendarScheduleSlot[],
) {
  return {
    title: title.trim(),
    description: form.description.trim() || undefined,
    classTypeId,
    coachId: form.coachId,
    capacity: Number(form.capacity),
    level: joinSessionLevels(form.levels),
    status: form.status,
    startDate,
    endDate,
    timezoneOffsetMinutes: STUDIO_TIMEZONE_OFFSET_MINUTES,
    slots: slots.map(({ weekday, startTime, endTime }) => ({
      weekday,
      startTime: normalizeTimeInputValue(startTime),
      endTime: normalizeTimeInputValue(endTime),
    })),
  };
}

export function replaceScheduleModalInUrl(
  pathname: string,
  searchParams: URLSearchParams,
  router: AppRouterInstance,
  modal: string | null,
): void {
  const params = new URLSearchParams(searchParams.toString());
  if (modal === null) {
    params.delete(SCHEDULE_MODAL_QUERY_KEY);
    params.delete(LEGACY_EDIT_CLASS_TYPE_QUERY_KEY);
  } else {
    params.set(SCHEDULE_MODAL_QUERY_KEY, modal);
    params.delete(LEGACY_EDIT_CLASS_TYPE_QUERY_KEY);
  }
  const qs = params.toString();
  router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
}
