import type { AdminScheduleSession } from "@/components/admin/admin-schedule-management";
import { splitSessionLevels } from "@/components/admin/admin-schedule-session-display";
import { normalizeTimeInputValue } from "@/lib/date-display";
import {
  studioWallClockToUtc,
  utcToStudioCalendarDate,
  utcToStudioWallClockTime,
} from "@/lib/studio-timezone";

export type SessionEditFormState = {
  title: string;
  description: string;
  classTypeId: string;
  coachId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: string;
  levels: string[];
};

function isoDate(value: Date | string): string {
  return utcToStudioCalendarDate(new Date(value));
}

function timeValue(value: Date | string): string {
  return utcToStudioWallClockTime(new Date(value));
}

const SESSION_LEVEL_SEPARATOR = ", ";

export function joinSessionLevels(levels: readonly string[]): string | undefined {
  const uniqueLevels = Array.from(new Set(levels.map((value) => value.trim()).filter(Boolean)));
  return uniqueLevels.length > 0 ? uniqueLevels.join(SESSION_LEVEL_SEPARATOR) : undefined;
}

export function sessionEditFormFromRow(
  row: AdminScheduleSession,
  fallbackClassTypeId: string,
  fallbackCoachId: string,
): SessionEditFormState {
  const start = new Date(row.startsAt);
  const end = new Date(row.endsAt);
  return {
    title: row.title,
    description: row.description ?? "",
    classTypeId: row.classType.id || fallbackClassTypeId,
    coachId: row.coach.id || fallbackCoachId,
    date: isoDate(start),
    startTime: timeValue(start),
    endTime: timeValue(end),
    capacity: String(row.capacity),
    levels: splitSessionLevels(row.level),
  };
}

export function isSessionEditFormDirty(
  current: SessionEditFormState,
  snapshot: SessionEditFormState,
): boolean {
  return (
    current.title !== snapshot.title ||
    current.description !== snapshot.description ||
    current.classTypeId !== snapshot.classTypeId ||
    current.coachId !== snapshot.coachId ||
    current.date !== snapshot.date ||
    current.startTime !== snapshot.startTime ||
    current.endTime !== snapshot.endTime ||
    current.capacity !== snapshot.capacity ||
    current.levels.join("|") !== snapshot.levels.join("|")
  );
}

export function sessionEditFormPayload(form: SessionEditFormState, classTypeId: string) {
  const startTime = normalizeTimeInputValue(form.startTime);
  const endTime = normalizeTimeInputValue(form.endTime);
  return {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    classTypeId,
    coachId: form.coachId,
    startsAt: studioWallClockToUtc(form.date, startTime).toISOString(),
    endsAt: studioWallClockToUtc(form.date, endTime).toISOString(),
    capacity: Number(form.capacity),
    level: joinSessionLevels(form.levels),
  };
}
