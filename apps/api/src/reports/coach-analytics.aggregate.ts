import { BookingStatus } from '@prisma/client';

const OCCUPIED_BOOKING_STATUSES: ReadonlySet<BookingStatus> = new Set([
  BookingStatus.BOOKED,
  BookingStatus.COMPLETED,
  BookingStatus.MISSED,
]);

export type CoachSessionRow = {
  id: string;
  capacity: number;
  startsAt: Date;
  classTypeId: string;
  classTypeName: string;
};

export type CoachBookingRow = {
  sessionId: string;
  userId: string;
  status: BookingStatus;
};

export type CoachAnalyticsPeakTime = {
  hour: number;
  attendance: number;
};

export type CoachAnalyticsPayload = {
  range: { from: string; to: string };
  periodDays: number;
  totals: {
    totalClassesTaught: number;
    totalClientsTrained: number;
    averageAttendanceRate: number | null;
    classFillRate: number;
    mostPopularClassType: string | null;
    peakTime: CoachAnalyticsPeakTime | null;
    sessions: number;
    bookings: number;
    completed: number;
    missed: number;
    activeWaitlists: number;
    utilizationPercent: number;
    waitlistPressurePercent: number;
  };
  trend: Array<{
    date: string;
    sessions: number;
    bookings: number;
    waitlists: number;
    capacity: number;
    attendance: number;
    fillRate: number;
  }>;
  classTypeBreakdown: Array<{
    classTypeId: string;
    name: string;
    sessions: number;
    bookings: number;
    attendance: number;
  }>;
  hourlyAttendance: Array<{ hour: number; attendance: number }>;
};

function isOccupiedBooking(status: BookingStatus): boolean {
  return OCCUPIED_BOOKING_STATUSES.has(status);
}

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function countBySessionId(
  items: Array<{ sessionId: string }>,
): Map<string, number> {
  const result = new Map<string, number>();
  for (const item of items) {
    result.set(item.sessionId, (result.get(item.sessionId) ?? 0) + 1);
  }
  return result;
}

function computeAttendanceRate(
  completed: number,
  missed: number,
): number | null {
  const total = completed + missed;
  if (total <= 0) {
    return null;
  }
  return Math.round((completed / total) * 100);
}

export function buildEmptyCoachAnalytics(
  range: { from: Date; to: Date },
  periodDays: number,
): CoachAnalyticsPayload {
  return {
    range: { from: range.from.toISOString(), to: range.to.toISOString() },
    periodDays,
    totals: {
      totalClassesTaught: 0,
      totalClientsTrained: 0,
      averageAttendanceRate: null,
      classFillRate: 0,
      mostPopularClassType: null,
      peakTime: null,
      sessions: 0,
      bookings: 0,
      completed: 0,
      missed: 0,
      activeWaitlists: 0,
      utilizationPercent: 0,
      waitlistPressurePercent: 0,
    },
    trend: [],
    classTypeBreakdown: [],
    hourlyAttendance: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      attendance: 0,
    })),
  };
}

export function aggregateCoachAnalytics(
  range: { from: Date; to: Date },
  periodDays: number,
  sessions: CoachSessionRow[],
  bookings: CoachBookingRow[],
  waitlists: Array<{ sessionId: string }>,
): CoachAnalyticsPayload {
  if (sessions.length === 0) {
    return buildEmptyCoachAnalytics(range, periodDays);
  }

  const occupiedBookings = bookings.filter((booking) =>
    isOccupiedBooking(booking.status),
  );
  const completedBookings = bookings.filter(
    (booking) => booking.status === BookingStatus.COMPLETED,
  );
  const missedBookings = bookings.filter(
    (booking) => booking.status === BookingStatus.MISSED,
  );
  const occupiedBySession = countBySessionId(occupiedBookings);
  const waitlistBySession = countBySessionId(waitlists);

  const trainedClients = new Set(
    completedBookings.map((booking) => booking.userId),
  );
  const hourlyAttendance = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    attendance: 0,
  }));
  const classTypeMap = new Map<
    string,
    {
      classTypeId: string;
      name: string;
      sessions: number;
      bookings: number;
      attendance: number;
    }
  >();
  const daily = new Map<
    string,
    {
      date: string;
      sessions: number;
      bookings: number;
      waitlists: number;
      capacity: number;
      attendance: number;
      fillRate: number;
    }
  >();

  for (const session of sessions) {
    const occupied = occupiedBySession.get(session.id) ?? 0;
    const attendance = bookings.filter(
      (booking) =>
        booking.sessionId === session.id &&
        booking.status === BookingStatus.COMPLETED,
    ).length;
    const date = localDateKey(session.startsAt);
    const prev = daily.get(date) ?? {
      date,
      sessions: 0,
      bookings: 0,
      waitlists: 0,
      capacity: 0,
      attendance: 0,
      fillRate: 0,
    };
    prev.sessions += 1;
    prev.bookings += occupied;
    prev.waitlists += waitlistBySession.get(session.id) ?? 0;
    prev.capacity += session.capacity;
    prev.attendance += attendance;
    daily.set(date, prev);

    const typeEntry = classTypeMap.get(session.classTypeId) ?? {
      classTypeId: session.classTypeId,
      name: session.classTypeName,
      sessions: 0,
      bookings: 0,
      attendance: 0,
    };
    typeEntry.sessions += 1;
    typeEntry.bookings += occupied;
    typeEntry.attendance += attendance;
    classTypeMap.set(session.classTypeId, typeEntry);
  }

  for (const booking of completedBookings) {
    const session = sessions.find((item) => item.id === booking.sessionId);
    if (!session) {
      continue;
    }
    hourlyAttendance[session.startsAt.getHours()].attendance += 1;
  }

  const trend = [...daily.values()]
    .map((day) => ({
      ...day,
      fillRate:
        day.capacity > 0 ? Math.round((day.bookings / day.capacity) * 100) : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totals = trend.reduce(
    (acc, day) => {
      acc.sessions += day.sessions;
      acc.bookings += day.bookings;
      acc.activeWaitlists += day.waitlists;
      acc.capacity += day.capacity;
      acc.attendance += day.attendance;
      return acc;
    },
    {
      sessions: 0,
      bookings: 0,
      activeWaitlists: 0,
      capacity: 0,
      attendance: 0,
    },
  );

  const classFillRate =
    totals.capacity > 0
      ? Math.round((totals.bookings / totals.capacity) * 100)
      : 0;
  const waitlistPressurePercent =
    totals.sessions > 0
      ? Math.round((totals.activeWaitlists / totals.sessions) * 100)
      : 0;

  const classTypeBreakdown = [...classTypeMap.values()].sort(
    (a, b) => b.attendance - a.attendance || b.bookings - a.bookings,
  );
  const peakBucket = hourlyAttendance.reduce((best, bucket) =>
    bucket.attendance > best.attendance ? bucket : best,
  );

  return {
    range: { from: range.from.toISOString(), to: range.to.toISOString() },
    periodDays,
    totals: {
      totalClassesTaught: totals.sessions,
      totalClientsTrained: trainedClients.size,
      averageAttendanceRate: computeAttendanceRate(
        completedBookings.length,
        missedBookings.length,
      ),
      classFillRate,
      mostPopularClassType: classTypeBreakdown[0]?.name ?? null,
      peakTime:
        peakBucket.attendance > 0
          ? { hour: peakBucket.hour, attendance: peakBucket.attendance }
          : null,
      sessions: totals.sessions,
      bookings: totals.bookings,
      completed: completedBookings.length,
      missed: missedBookings.length,
      activeWaitlists: totals.activeWaitlists,
      utilizationPercent: classFillRate,
      waitlistPressurePercent,
    },
    trend,
    classTypeBreakdown,
    hourlyAttendance,
  };
}
