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
  if ("lastName" in coach.user) {
    return [coach.user.name, coach.user.lastName].filter(Boolean).join(" ") || coach.user.email || "—";
  }
  return coach.user.name ?? coach.user.email ?? "—";
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
  const formatter = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
  return {
    start: formatter.format(new Date(startsAt)),
    end: formatter.format(new Date(endsAt)),
  };
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
