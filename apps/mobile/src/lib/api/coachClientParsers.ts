import type {
  CoachAccountMe,
  CoachAccountUser,
  CoachAnalyticsPayload,
  CoachNotificationPrefs,
  CoachPanelBookingRow,
  CoachPanelSessionRow,
  CoachSalarySummary,
  CoachSessionStatus,
} from "../../features/coach/types/coachPanel";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return typeof value === "string" ? value : null;
}

function parseNotificationPrefs(value: unknown): CoachNotificationPrefs {
  if (!isRecord(value)) {
    return {
      bookingReminders: true,
      waitlistAlerts: true,
      promotions: false,
      communityUpdates: true,
    };
  }
  return {
    bookingReminders: value.bookingReminders !== false,
    waitlistAlerts: value.waitlistAlerts !== false,
    promotions: value.promotions === true,
    communityUpdates: value.communityUpdates !== false,
  };
}

function parseAccountUser(value: unknown): CoachAccountUser {
  if (!isRecord(value) || typeof value.email !== "string" || typeof value.role !== "string") {
    throw new Error("Unexpected account response");
  }
  return {
    email: value.email,
    name: asStringOrNull(value.name),
    lastName: asStringOrNull(value.lastName),
    phone: asStringOrNull(value.phone),
    locale: asStringOrNull(value.locale),
    role: value.role,
    homeImageUrl: asStringOrNull(value.homeImageUrl),
    dateOfBirth: asStringOrNull(value.dateOfBirth),
  };
}

export function parseCoachAccountMe(body: unknown): CoachAccountMe {
  if (!isRecord(body)) {
    throw new Error("Unexpected account response");
  }
  return {
    user: parseAccountUser(body.user),
    coachProfileId: asStringOrNull(body.coachProfileId),
    coachBio: asStringOrNull(body.coachBio),
    notificationPrefs: parseNotificationPrefs(body.notificationPrefs),
  };
}

const SESSION_STATUSES: readonly CoachSessionStatus[] = [
  "ACTIVE",
  "CANCELLED",
  "FULL",
  "DRAFT",
];

export function parseSessionRow(value: unknown): CoachPanelSessionRow | null {
  if (!isRecord(value) || typeof value.id !== "string") {
    return null;
  }
  if (
    typeof value.title !== "string" ||
    typeof value.startsAt !== "string" ||
    typeof value.endsAt !== "string" ||
    typeof value.capacity !== "number" ||
    typeof value.status !== "string" ||
    !SESSION_STATUSES.includes(value.status as CoachSessionStatus)
  ) {
    return null;
  }
  if (
    !isRecord(value.classType) ||
    typeof value.classType.id !== "string" ||
    typeof value.classType.name !== "string"
  ) {
    return null;
  }
  const count =
    isRecord(value._count) && typeof value._count.bookings === "number"
      ? value._count.bookings
      : 0;
  return {
    id: value.id,
    title: value.title,
    startsAt: value.startsAt,
    endsAt: value.endsAt,
    capacity: value.capacity,
    level: asStringOrNull(value.level),
    classFormat: asStringOrNull(value.classFormat),
    status: value.status as CoachSessionStatus,
    classType: { id: value.classType.id, name: value.classType.name },
    _count: { bookings: count },
  };
}

export function parseBookingRow(value: unknown): CoachPanelBookingRow | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.status !== "string") {
    return null;
  }
  if (!isRecord(value.user) || typeof value.user.email !== "string") {
    return null;
  }
  if (
    !isRecord(value.session) ||
    typeof value.session.id !== "string" ||
    typeof value.session.startsAt !== "string" ||
    typeof value.session.endsAt !== "string" ||
    typeof value.session.coachId !== "string" ||
    !isRecord(value.session.classType) ||
    typeof value.session.classType.name !== "string"
  ) {
    return null;
  }
  return {
    id: value.id,
    status: value.status,
    user: {
      name: asStringOrNull(value.user.name),
      email: value.user.email,
    },
    session: {
      id: value.session.id,
      startsAt: value.session.startsAt,
      endsAt: value.session.endsAt,
      coachId: value.session.coachId,
      classType: { name: value.session.classType.name },
    },
  };
}

export function parseSalary(body: unknown): CoachSalarySummary | null {
  if (!isRecord(body)) {
    return null;
  }
  if (
    typeof body.coachProfileId !== "string" ||
    typeof body.completedSessions !== "number" ||
    typeof body.totalEarningsCents !== "number" ||
    typeof body.pendingPayoutCents !== "number" ||
    typeof body.paidOutCents !== "number"
  ) {
    return null;
  }
  return {
    coachProfileId: body.coachProfileId,
    completedSessions: body.completedSessions,
    totalEarningsCents: body.totalEarningsCents,
    pendingPayoutCents: body.pendingPayoutCents,
    paidOutCents: body.paidOutCents,
  };
}

export function parseAnalytics(body: unknown): CoachAnalyticsPayload {
  if (!isRecord(body) || !isRecord(body.totals) || !isRecord(body.range)) {
    throw new Error("Unexpected analytics response");
  }
  const totals = body.totals;
  return {
    range: {
      from: String(body.range.from ?? ""),
      to: String(body.range.to ?? ""),
    },
    periodDays: typeof body.periodDays === "number" ? body.periodDays : 0,
    totals: {
      totalClassesTaught: Number(totals.totalClassesTaught ?? 0),
      totalClientsTrained: Number(totals.totalClientsTrained ?? 0),
      averageAttendanceRate:
        totals.averageAttendanceRate === null ||
        totals.averageAttendanceRate === undefined
          ? null
          : Number(totals.averageAttendanceRate),
      classFillRate: Number(totals.classFillRate ?? 0),
      mostPopularClassType: asStringOrNull(totals.mostPopularClassType),
      peakTime:
        isRecord(totals.peakTime) &&
        typeof totals.peakTime.hour === "number" &&
        typeof totals.peakTime.attendance === "number"
          ? {
              hour: totals.peakTime.hour,
              attendance: totals.peakTime.attendance,
            }
          : null,
      sessions: Number(totals.sessions ?? 0),
      bookings: Number(totals.bookings ?? 0),
      completed: Number(totals.completed ?? 0),
      missed: Number(totals.missed ?? 0),
      activeWaitlists: Number(totals.activeWaitlists ?? 0),
      utilizationPercent: Number(totals.utilizationPercent ?? 0),
      waitlistPressurePercent: Number(totals.waitlistPressurePercent ?? 0),
    },
    trend: Array.isArray(body.trend)
      ? (body.trend as CoachAnalyticsPayload["trend"])
      : [],
    classTypeBreakdown: Array.isArray(body.classTypeBreakdown)
      ? (body.classTypeBreakdown as CoachAnalyticsPayload["classTypeBreakdown"])
      : [],
    hourlyAttendance: Array.isArray(body.hourlyAttendance)
      ? (body.hourlyAttendance as CoachAnalyticsPayload["hourlyAttendance"])
      : [],
  };
}
