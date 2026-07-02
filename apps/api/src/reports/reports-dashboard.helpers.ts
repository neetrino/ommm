import { BookingStatus } from '@prisma/client';
import { joinName } from './reports.helpers';

export function mapBookingStatusCounts(
  rows: Array<{ status: BookingStatus; _count: { id: number } }>,
): Record<BookingStatus, number> {
  const initial: Record<BookingStatus, number> = {
    BOOKED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    MISSED: 0,
  };

  for (const row of rows) {
    initial[row.status] = row._count.id;
  }

  return initial;
}

export function resolveRevenueSummary(
  todayRevenueCents: number,
  monthRevenueCents: number,
  previousMonthRevenueCents: number,
  pendingPaymentsCents: number,
  pendingPaymentsCount: number,
) {
  const trendPercent =
    previousMonthRevenueCents > 0
      ? Math.round(
          ((monthRevenueCents - previousMonthRevenueCents) /
            previousMonthRevenueCents) *
            100,
        )
      : null;

  return {
    todayRevenueCents,
    monthRevenueCents,
    pendingPaymentsCents,
    pendingPaymentsCount,
    trendPercent,
  };
}

type DashboardAlert = {
  code: string;
  level: 'info' | 'warning';
  count: number;
};

const DASHBOARD_ALERT_RULES: ReadonlyArray<{
  code: string;
  level: DashboardAlert['level'];
  field: keyof DashboardAlertInput;
}> = [
  { code: 'classes_full_today', level: 'info', field: 'fullClassesToday' },
  {
    code: 'waitlist_pressure',
    level: 'warning',
    field: 'waitlistPressureCount',
  },
  {
    code: 'classes_cancelled_today',
    level: 'warning',
    field: 'cancelledClassesToday',
  },
  { code: 'payments_pending', level: 'warning', field: 'pendingPaymentsCount' },
  {
    code: 'draft_classes_upcoming',
    level: 'info',
    field: 'draftClassesUpcoming',
  },
  {
    code: 'upcoming_cancellations',
    level: 'info',
    field: 'upcomingCancellationsCount',
  },
];

type DashboardAlertInput = {
  fullClassesToday: number;
  waitlistPressureCount: number;
  cancelledClassesToday: number;
  pendingPaymentsCount: number;
  draftClassesUpcoming: number;
  upcomingCancellationsCount: number;
};

export function buildAlerts(input: DashboardAlertInput): DashboardAlert[] {
  return DASHBOARD_ALERT_RULES.flatMap(({ code, level, field }) =>
    input[field] > 0 ? [{ code, level, count: input[field] }] : [],
  );
}

type TodayClassRow = {
  id: string;
  startsAt: Date;
  capacity: number;
  status: string;
  classType: { name: string };
  coach: {
    user: { name: string | null; lastName: string | null; email: string };
  };
  _count: { bookings: number };
};

export function mapTodayUpcomingClasses(
  sessions: TodayClassRow[],
  limit: number,
) {
  return sessions.slice(0, limit).map((session) => ({
    id: session.id,
    className: session.classType.name,
    startsAt: session.startsAt.toISOString(),
    coachName: joinName(
      session.coach.user.name,
      session.coach.user.lastName,
      session.coach.user.email,
    ),
    bookedCount: session._count.bookings,
    capacity: session.capacity,
    status: session.status,
  }));
}

type UpcomingCancellationRow = {
  id: string;
  status: string;
  user: { name: string | null; lastName: string | null; email: string };
  session: { startsAt: Date; classType: { name: string } };
};

export function mapUpcomingBookingCancellations(
  bookings: UpcomingCancellationRow[],
  limit: number,
) {
  return bookings
    .map((booking) => ({
      id: booking.id,
      type: 'booking' as const,
      userName: joinName(
        booking.user.name,
        booking.user.lastName,
        booking.user.email,
      ),
      itemName: booking.session.classType.name,
      dateTime: booking.session.startsAt.toISOString(),
      status: booking.status,
    }))
    .sort((a, b) => a.dateTime.localeCompare(b.dateTime))
    .slice(0, limit);
}

type RecentUserRow = {
  id: string;
  createdAt: Date;
  name: string | null;
  lastName: string | null;
  email: string;
};

export function mapRecentUserSummaries(users: RecentUserRow[]) {
  return users.map((user) => ({
    id: user.id,
    name: joinName(user.name, user.lastName, user.email),
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  }));
}
