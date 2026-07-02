import { Prisma, BookingStatus, PaymentStatus } from '@prisma/client';
import {
  AdminClientQuickFilter,
  AdminClientStatusFilter,
  AdminClientTagFilter,
  AdminClientOrder,
  type AdminListClientsQueryDto,
} from './dto/admin-list-clients-query.dto';
import {
  INACTIVE_CLIENT_DAYS,
  NEW_CLIENT_DAYS,
} from './clients-list.constants';

export const clientInclude = Prisma.validator<Prisma.UserInclude>()({
  bookings: {
    include: {
      session: {
        include: {
          classType: true,
          coach: {
            include: {
              user: { select: { id: true, name: true, lastName: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  },
  payments: { orderBy: { createdAt: 'desc' }, take: 50 },
  giftCardsPurchased: { orderBy: { createdAt: 'desc' }, take: 20 },
  giftCardsReceived: { orderBy: { createdAt: 'desc' }, take: 20 },
  clientNotesReceived: {
    orderBy: { createdAt: 'desc' },
    take: 1,
    include: { author: { select: { id: true, name: true, email: true } } },
  },
  _count: { select: { clientNotesReceived: true } },
});

export type ClientRecord = Prisma.UserGetPayload<{ include: typeof clientInclude }>;
export type ClientTag = 'VIP' | 'New' | 'At Risk' | 'Beginner';
export type ClientStatus = 'Active' | 'Inactive' | 'Blocked';
export type PaymentBehavior = 'paid' | 'unpaid' | 'overdue' | 'partial';
export type AttendanceBehavior =
  | 'regular'
  | 'no-show'
  | 'often-cancels'
  | 'low-attendance';

export type ClientRow = ReturnType<typeof toClientRow>;

function hasGiftCardActivity(user: ClientRecord): boolean {
  if (user.giftCardsReceived.length > 0) {
    return true;
  }
  return user.giftCardsPurchased.some(
    (card) => card.balanceAmd < card.amountAmd || card.status === 'REDEEMED',
  );
}

function getLatestVisit(user: ClientRecord) {
  return (
    user.bookings
      .filter((booking) => booking.status === BookingStatus.COMPLETED)
      .sort(
        (a, b) => b.session.startsAt.getTime() - a.session.startsAt.getTime(),
      )[0] ?? null
  );
}

function getBookingTotals(user: ClientRecord) {
  return {
    total: user.bookings.length,
    attended: user.bookings.filter(
      (booking) => booking.status === BookingStatus.COMPLETED,
    ).length,
    cancelled: user.bookings.filter(
      (booking) => booking.status === BookingStatus.CANCELLED,
    ).length,
    noShows: user.bookings.filter(
      (booking) => booking.status === BookingStatus.MISSED,
    ).length,
  };
}

function getClientStatus(user: ClientRecord): ClientStatus {
  if (user.isBlocked) {
    return 'Blocked';
  }
  const latestVisit = getLatestVisit(user);
  if (!latestVisit) {
    return 'Inactive';
  }
  const inactiveMs = INACTIVE_CLIENT_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - latestVisit.session.startsAt.getTime() <= inactiveMs
    ? 'Active'
    : 'Inactive';
}

function getSource(user: ClientRecord): 'website' | 'mobile-app' | 'admin' | null {
  const firstBooking = [...user.bookings].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  )[0];
  if (!firstBooking) {
    return null;
  }
  return firstBooking.channel === 'APP' ? 'mobile-app' : 'website';
}

function getPaymentBehavior(user: ClientRecord): PaymentBehavior {
  if (user.payments.some((payment) => payment.status === PaymentStatus.FAILED)) {
    return 'overdue';
  }
  if (user.payments.some((payment) => payment.status === PaymentStatus.PENDING)) {
    return 'unpaid';
  }
  return user.payments.some(
    (payment) => payment.status === PaymentStatus.SUCCEEDED,
  )
    ? 'paid'
    : 'unpaid';
}

function getAttendanceBehavior(params: {
  total: number;
  attended: number;
  cancelled: number;
  noShows: number;
}): AttendanceBehavior {
  if (params.noShows > 0) {
    return 'no-show';
  }
  if (params.total >= 3 && params.cancelled / params.total >= 0.35) {
    return 'often-cancels';
  }
  if (params.total >= 3 && params.attended / params.total < 0.5) {
    return 'low-attendance';
  }
  return 'regular';
}

function getClassLevels(user: ClientRecord) {
  return Array.from(
    new Set(
      user.bookings
        .map(
          (booking) =>
            booking.session.level ?? booking.session.classType.name,
        )
        .filter((value): value is string => Boolean(value)),
    ),
  );
}

function getTags(params: {
  user: ClientRecord;
  paymentBehavior: PaymentBehavior;
  classLevels: string[];
}): ClientTag[] {
  const tags: ClientTag[] = [];
  const createdMs = params.user.createdAt.getTime();
  const isNew =
    Date.now() - createdMs <= NEW_CLIENT_DAYS * 24 * 60 * 60 * 1000;
  if (isNew) tags.push('New');
  if (
    params.paymentBehavior === 'overdue' ||
    params.paymentBehavior === 'unpaid'
  ) {
    tags.push('At Risk');
  }
  if (
    params.classLevels.some((level) =>
      level.toLowerCase().includes('beginner'),
    )
  ) {
    tags.push('Beginner');
  }
  return tags;
}

function getPreferredCoach(user: ClientRecord) {
  const counts = new Map<
    string,
    { id: string; name: string; count: number }
  >();
  for (const booking of user.bookings) {
    const coach = booking.session.coach;
    const name = [coach.user.name, coach.user.lastName]
      .filter(Boolean)
      .join(' ');
    const current = counts.get(coach.id);
    counts.set(coach.id, {
      id: coach.id,
      name: name || '—',
      count: (current?.count ?? 0) + 1,
    });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count)[0] ?? null;
}

export function toClientRow(user: ClientRecord) {
  const latestBooking = getLatestVisit(user);
  const totals = getBookingTotals(user);
  const lifetimeValueCents = user.payments
    .filter((payment) => payment.status === PaymentStatus.SUCCEEDED)
    .reduce((sum, payment) => sum + payment.amountCents, 0);
  const paymentBehavior = getPaymentBehavior(user);
  const attendanceBehavior = getAttendanceBehavior(totals);
  const classLevels = getClassLevels(user);
  const tags = getTags({ user, paymentBehavior, classLevels });
  const preferredCoach = getPreferredCoach(user);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    lastName: user.lastName,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    status: getClientStatus(user),
    source: getSource(user),
    preferredCoach,
    paymentBehavior,
    attendanceBehavior,
    classLevels,
    tags,
    noteCount: user._count.clientNotesReceived,
    latestNote: user.clientNotesReceived[0] ?? null,
    totalVisits: totals.attended,
    totalBookings: totals.total,
    totalCancellations: totals.cancelled,
    totalNoShows: totals.noShows,
    lifetimeValueCents,
    lastVisitDate: latestBooking?.session.startsAt ?? null,
    birthdayMonth: user.dateOfBirth ? user.dateOfBirth.getMonth() + 1 : null,
    hasGiftCardActivity: hasGiftCardActivity(user),
    isBlocked: user.isBlocked,
    activePlanName: null,
    activePlanCostCents: null,
    activePlanExpiresAt: null,
    activePackageId: null,
    activePackageStatus: null,
  };
}

function dateValue(value: Date | null) {
  return value?.getTime() ?? 0;
}

function matchesTag(tags: ClientTag[], tag: AdminClientTagFilter) {
  const label =
    tag === AdminClientTagFilter.AT_RISK
      ? 'At Risk'
      : tag === AdminClientTagFilter.NEW
        ? 'New'
        : tag === AdminClientTagFilter.VIP
          ? 'VIP'
          : 'Beginner';
  return tags.includes(label);
}

function matchesStatus(status: ClientStatus, filter: AdminClientStatusFilter) {
  if (filter === AdminClientStatusFilter.BLOCKED) return status === 'Blocked';
  if (filter === AdminClientStatusFilter.FROZEN) return false;
  if (filter === AdminClientStatusFilter.ACTIVE) return status === 'Active';
  return status === 'Inactive';
}

function matchesClassLevel(levels: string[], filter: string) {
  return levels.some((level) =>
    level.toLowerCase().includes(filter.toLowerCase()),
  );
}

function matchesQuickFilter(
  row: ClientRow,
  filter: AdminClientQuickFilter,
) {
  if (filter === AdminClientQuickFilter.BIRTHDAY_THIS_MONTH) {
    return row.birthdayMonth === new Date().getMonth() + 1;
  }
  if (filter === AdminClientQuickFilter.INACTIVE_30_DAYS) {
    if (row.lastVisitDate === null) return row.status === 'Inactive';
    return (
      Date.now() - row.lastVisitDate.getTime() >
      INACTIVE_CLIENT_DAYS * 86400000
    );
  }
  if (filter === AdminClientQuickFilter.UNPAID)
    return row.paymentBehavior === 'unpaid';
  if (filter === AdminClientQuickFilter.NO_SHOW)
    return row.attendanceBehavior === 'no-show';
  if (filter === AdminClientQuickFilter.AT_RISK)
    return row.tags.includes('At Risk');
  if (filter === AdminClientQuickFilter.VIP) return row.tags.includes('VIP');
  return row.tags.includes('New');
}

export function matchesClientFilters(
  row: ClientRow,
  query: AdminListClientsQueryDto,
) {
  if (query.tag && !matchesTag(row.tags, query.tag)) return false;
  if (query.status && !matchesStatus(row.status, query.status)) return false;
  if (
    query.classLevel &&
    !matchesClassLevel(row.classLevels, query.classLevel)
  )
    return false;
  if (query.paymentStatus && row.paymentBehavior !== String(query.paymentStatus))
    return false;
  if (query.source && row.source !== query.source) return false;
  if (
    query.preferredCoachId &&
    row.preferredCoach?.id !== query.preferredCoachId
  )
    return false;
  if (query.attendance && row.attendanceBehavior !== String(query.attendance))
    return false;
  if (query.birthdayMonth && row.birthdayMonth !== query.birthdayMonth)
    return false;
  if (query.giftCardOnly && !row.hasGiftCardActivity) return false;
  if (
    query.quick?.length &&
    !query.quick.some((filter) => matchesQuickFilter(row, filter))
  ) {
    return false;
  }
  return true;
}

export function sortClientRows(rows: ClientRow[], order: AdminClientOrder) {
  return [...rows].sort((a, b) => {
    if (order === AdminClientOrder.OLDEST)
      return a.createdAt.getTime() - b.createdAt.getTime();
    if (order === AdminClientOrder.MOST_ACTIVE)
      return b.totalVisits - a.totalVisits;
    if (order === AdminClientOrder.HIGHEST_LIFETIME_VALUE)
      return b.lifetimeValueCents - a.lifetimeValueCents;
    if (order === AdminClientOrder.LAST_VISIT_NEWEST)
      return dateValue(b.lastVisitDate) - dateValue(a.lastVisitDate);
    if (order === AdminClientOrder.LAST_VISIT_OLDEST)
      return dateValue(a.lastVisitDate) - dateValue(b.lastVisitDate);
    if (order === AdminClientOrder.MOST_BOOKINGS)
      return b.totalBookings - a.totalBookings;
    if (order === AdminClientOrder.MOST_CANCELLATIONS)
      return b.totalCancellations - a.totalCancellations;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}
