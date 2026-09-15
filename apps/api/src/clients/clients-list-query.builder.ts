import {
  BookingStatus,
  PaymentStatus,
  Prisma,
  Role,
  UserPackageStatus,
} from '@prisma/client';
import {
  influencerSucceededWhere,
  revenueSucceededWhere,
} from '../payments/payment-revenue.util';
import {
  AdminClientAttendanceFilter,
  AdminClientOrder,
  AdminClientPackageFilter,
  AdminClientPaymentStatusFilter,
  AdminClientQuickFilter,
  AdminClientStatusFilter,
  AdminClientTagFilter,
  type AdminListClientsQueryDto,
} from './dto/admin-list-clients-query.dto';
import {
  INACTIVE_CLIENT_DAYS,
  NEW_CLIENT_DAYS,
} from './clients-list.constants';
import { buildClientsTextSearchWhere } from './clients-list-search';

const inactiveThreshold = () =>
  new Date(Date.now() - INACTIVE_CLIENT_DAYS * 24 * 60 * 60 * 1000);

const newClientThreshold = () =>
  new Date(Date.now() - NEW_CLIENT_DAYS * 24 * 60 * 60 * 1000);

const activeClientBookingWhere = {
  status: BookingStatus.COMPLETED,
  session: { startsAt: { gte: inactiveThreshold() } },
} as const;

const unpaidPaymentWhere: Prisma.UserWhereInput = {
  payments: { none: { status: PaymentStatus.SUCCEEDED } },
  NOT: { payments: { some: { status: PaymentStatus.FAILED } } },
};

function pushOr(
  and: Prisma.UserWhereInput[],
  clauses: Prisma.UserWhereInput[],
): void {
  if (clauses.length === 0) {
    return;
  }
  if (clauses.length === 1) {
    and.push(clauses[0]!);
    return;
  }
  and.push({ OR: clauses });
}

/** Filters/orders that still need in-memory row computation after DB pre-filter. */
export function requiresClientsPostProcessing(
  query: AdminListClientsQueryDto,
): boolean {
  if (query.birthdayMonth && query.birthdayMonth.length > 0) {
    return true;
  }
  if (query.giftCardOnly) {
    return true;
  }
  if (query.quick?.includes(AdminClientQuickFilter.BIRTHDAY_THIS_MONTH)) {
    return true;
  }
  if (query.preferredCoachId && query.preferredCoachId.length > 0) {
    return true;
  }
  const attendance = query.attendance ?? [];
  if (
    attendance.includes(AdminClientAttendanceFilter.REGULAR) ||
    attendance.includes(AdminClientAttendanceFilter.OFTEN_CANCELS) ||
    attendance.includes(AdminClientAttendanceFilter.LOW_ATTENDANCE)
  ) {
    return true;
  }
  const order = query.order ?? AdminClientOrder.NEWEST;
  return (
    order === AdminClientOrder.MOST_ACTIVE ||
    order === AdminClientOrder.HIGHEST_LIFETIME_VALUE ||
    order === AdminClientOrder.LAST_VISIT_NEWEST ||
    order === AdminClientOrder.LAST_VISIT_OLDEST ||
    order === AdminClientOrder.MOST_CANCELLATIONS
  );
}

export function buildClientsListWhere(
  query: AdminListClientsQueryDto,
): Prisma.UserWhereInput {
  const and: Prisma.UserWhereInput[] = [{ role: Role.USER }];
  const searchWhere = buildClientsTextSearchWhere(query.search ?? query.q);
  if (searchWhere) {
    and.push(searchWhere);
  }

  appendStatusFilter(and, query.status);
  appendPackageFilter(and, query.package);
  appendPaymentStatusFilter(and, query.paymentStatus);
  appendTagFilter(and, query.tag);
  appendAttendanceFilter(and, query.attendance);
  appendQuickFilters(and, query.quick);
  appendPreferredCoachFilter(and, query.preferredCoachId);
  appendSourceFilter(and, query.source);
  appendClassLevelFilter(and, query.classLevel);

  if (query.birthdayMonth && query.birthdayMonth.length > 0) {
    and.push({ dateOfBirth: { not: null } });
  }

  return { AND: and };
}

export function resolveClientsListOrderBy(
  query: AdminListClientsQueryDto,
): Prisma.UserOrderByWithRelationInput {
  const order = query.order ?? AdminClientOrder.NEWEST;
  if (order === AdminClientOrder.OLDEST) {
    return { createdAt: 'asc' };
  }
  if (order === AdminClientOrder.MOST_BOOKINGS) {
    return { bookings: { _count: 'desc' } };
  }
  return { createdAt: 'desc' };
}

function appendPackageFilter(
  and: Prisma.UserWhereInput[],
  packageFilters: AdminClientPackageFilter[] | undefined,
): void {
  const selected = (packageFilters ?? []).filter(
    (value) => value !== AdminClientPackageFilter.ALL,
  );
  if (selected.length === 0) {
    return;
  }
  const clauses: Prisma.UserWhereInput[] = [];
  for (const packageFilter of selected) {
    if (packageFilter === AdminClientPackageFilter.ACTIVE) {
      clauses.push({
        userPackages: { some: { status: UserPackageStatus.ACTIVE } },
      });
      continue;
    }
    clauses.push({
      userPackages: { none: { status: UserPackageStatus.ACTIVE } },
    });
  }
  pushOr(and, clauses);
}

function statusClause(status: AdminClientStatusFilter): Prisma.UserWhereInput {
  if (status === AdminClientStatusFilter.BLOCKED) {
    return { isBlocked: true };
  }
  if (status === AdminClientStatusFilter.FROZEN) {
    return { id: '__frozen-none__' };
  }
  if (status === AdminClientStatusFilter.ACTIVE) {
    return {
      isBlocked: false,
      bookings: { some: activeClientBookingWhere },
    };
  }
  return {
    isBlocked: false,
    NOT: { bookings: { some: activeClientBookingWhere } },
  };
}

function appendStatusFilter(
  and: Prisma.UserWhereInput[],
  statuses: AdminClientStatusFilter[] | undefined,
): void {
  if (!statuses?.length) {
    return;
  }
  pushOr(
    and,
    statuses.map((status) => statusClause(status)),
  );
}

function paymentStatusClause(
  paymentStatus: AdminClientPaymentStatusFilter,
): Prisma.UserWhereInput | null {
  if (paymentStatus === AdminClientPaymentStatusFilter.OVERDUE) {
    return { payments: { some: { status: PaymentStatus.FAILED } } };
  }
  if (paymentStatus === AdminClientPaymentStatusFilter.UNPAID) {
    return unpaidPaymentWhere;
  }
  if (paymentStatus === AdminClientPaymentStatusFilter.PAID) {
    return {
      payments: {
        some: revenueSucceededWhere,
      },
    };
  }
  return null;
}

function appendPaymentStatusFilter(
  and: Prisma.UserWhereInput[],
  paymentStatuses: AdminClientPaymentStatusFilter[] | undefined,
): void {
  if (!paymentStatuses?.length) {
    return;
  }
  const clauses = paymentStatuses
    .map((status) => paymentStatusClause(status))
    .filter((clause): clause is Prisma.UserWhereInput => clause !== null);
  pushOr(and, clauses);
}

function tagClause(tag: AdminClientTagFilter): Prisma.UserWhereInput | null {
  if (tag === AdminClientTagFilter.NEW) {
    return { createdAt: { gte: newClientThreshold() } };
  }
  if (tag === AdminClientTagFilter.BEGINNER) {
    return {
      bookings: {
        some: {
          session: {
            OR: [
              {
                level: {
                  contains: 'beginner',
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                classType: {
                  name: {
                    contains: 'beginner',
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              },
            ],
          },
        },
      },
    };
  }
  if (tag === AdminClientTagFilter.INFLUENCER) {
    return {
      payments: {
        some: influencerSucceededWhere,
      },
    };
  }
  return null;
}

function appendTagFilter(
  and: Prisma.UserWhereInput[],
  tags: AdminClientTagFilter[] | undefined,
): void {
  if (!tags?.length) {
    return;
  }
  const clauses = tags
    .map((tag) => tagClause(tag))
    .filter((clause): clause is Prisma.UserWhereInput => clause !== null);
  pushOr(and, clauses);
}

function appendAttendanceFilter(
  and: Prisma.UserWhereInput[],
  attendance: AdminClientAttendanceFilter[] | undefined,
): void {
  if (!attendance?.includes(AdminClientAttendanceFilter.NO_SHOW)) {
    return;
  }
  and.push({ bookings: { some: { status: BookingStatus.MISSED } } });
}

function appendPreferredCoachFilter(
  and: Prisma.UserWhereInput[],
  coachIds: string[] | undefined,
): void {
  if (!coachIds?.length) {
    return;
  }
  pushOr(
    and,
    coachIds.map((coachId) => ({
      bookings: { some: { session: { coachId } } },
    })),
  );
}

function appendSourceFilter(
  and: Prisma.UserWhereInput[],
  sources: string[] | undefined,
): void {
  if (!sources?.length) {
    return;
  }
  const clauses: Prisma.UserWhereInput[] = [];
  for (const source of sources) {
    if (source === 'mobile-app') {
      clauses.push({ bookings: { some: { channel: 'APP' } } });
      continue;
    }
    if (source === 'website') {
      clauses.push({ bookings: { some: { channel: 'WEBSITE' } } });
      continue;
    }
    if (source === 'admin') {
      clauses.push({ bookings: { none: {} } });
    }
  }
  pushOr(and, clauses);
}

function appendClassLevelFilter(
  and: Prisma.UserWhereInput[],
  classLevels: string[] | undefined,
): void {
  if (!classLevels?.length) {
    return;
  }
  pushOr(
    and,
    classLevels.map((level) => ({
      bookings: {
        some: {
          session: {
            OR: [
              {
                level: { contains: level, mode: Prisma.QueryMode.insensitive },
              },
              {
                classType: {
                  name: {
                    contains: level,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              },
            ],
          },
        },
      },
    })),
  );
}

function appendQuickFilters(
  and: Prisma.UserWhereInput[],
  quick: AdminClientQuickFilter[] | undefined,
): void {
  if (!quick?.length) {
    return;
  }
  const quickOr: Prisma.UserWhereInput[] = [];
  for (const filter of quick) {
    if (filter === AdminClientQuickFilter.NEW) {
      quickOr.push({ createdAt: { gte: newClientThreshold() } });
      continue;
    }
    if (filter === AdminClientQuickFilter.UNPAID) {
      quickOr.push(unpaidPaymentWhere);
      continue;
    }
    if (filter === AdminClientQuickFilter.NO_SHOW) {
      quickOr.push({ bookings: { some: { status: BookingStatus.MISSED } } });
      continue;
    }
    if (filter === AdminClientQuickFilter.INACTIVE_30_DAYS) {
      quickOr.push({
        isBlocked: false,
        NOT: { bookings: { some: activeClientBookingWhere } },
      });
    }
  }
  if (quickOr.length > 0) {
    and.push({ OR: quickOr });
  }
}
