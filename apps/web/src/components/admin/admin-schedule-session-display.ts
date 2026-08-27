import { formatTimeForUiFromIso } from "@/lib/format-time-display";

type ScheduleCoachUser = {
  name: string | null;
  lastName?: string | null;
  email?: string;
};

type ScheduleCoachRef = {
  user: ScheduleCoachUser;
};

type SessionCountRef = {
  capacity: number;
  _count: { bookings: number };
};

type SessionTimeRef = {
  startsAt: string;
  endsAt: string;
};

export function coachName(coach: ScheduleCoachRef): string {
  return (
    [coach.user.name, coach.user.lastName].filter(Boolean).join(" ") ||
    coach.user.email ||
    "—"
  );
}

export function durationMinutes(row: SessionTimeRef): number {
  return Math.max(
    0,
    Math.round((new Date(row.endsAt).getTime() - new Date(row.startsAt).getTime()) / 60000),
  );
}

export function spotsLeft(row: SessionCountRef): number {
  return Math.max(row.capacity - row._count.bookings, 0);
}

export function formatSessionTimes(
  locale: string,
  startsAt: string,
  endsAt: string,
): { start: string; end: string } {
  return {
    start: formatTimeForUiFromIso(startsAt, locale),
    end: formatTimeForUiFromIso(endsAt, locale),
  };
}

/** Class-type line under the session title — omit when it repeats the title. */
export function sessionClassSubtitle(
  title: string,
  classTypeName: string,
  classFormat?: string | null,
): string | null {
  const parts: string[] = [];
  if (classTypeName.trim() !== title.trim()) {
    parts.push(classTypeName);
  }
  const format = classFormat?.trim();
  if (format) {
    parts.push(format);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function splitSessionLevels(level: string | null | undefined): string[] {
  if (!level) {
    return [];
  }
  return level
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}
