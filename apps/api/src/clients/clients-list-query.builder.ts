import { BookingStatus, PaymentStatus, Prisma, Role, UserPackageStatus } from '@prisma/client';
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

/** Filters/orders that still need in-memory row computation after DB pre-filter. */
export function requiresClientsPostProcessing(
  query: AdminListClientsQueryDto,
): boolean {
  if (query.birthdayMonth !== undefined) {
    return true;
  }
  if (query.giftCardOnly) {
    return true;
  }
  if (query.quick?.includes(AdminClientQuickFilter.BIRTHDAY_THIS_MONTH)) {
    return true;
  }
  if (query.preferredCoachId) {
    return true;
  }
  if (
    query.attendance === AdminClientAttendanceFilter.REGULAR ||
    query.attendance === AdminClientAttendanceFilter.OFTEN_CANCELS ||
    query.attendance === AdminClientAttendanceFilter.LOW_ATTENDANCE
  ) {
    return true;
  }
  if (query.tag === AdminClientTagFilter.VIP) {
    return true;
  }
  if (query.quick?.includes(AdminClientQuickFilter.VIP)) {
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
  const q = (query.search ?? query.q)?.trim();
  const and: Prisma.UserWhereInput[] = [{ role: Role.USER }];

  if (q) {
    and.push({
      OR: [
        { id: { contains: q, mode: Prisma.QueryMode.insensitive } },
        { email: { contains: q, mode: Prisma.QueryMode.insensitive } },
        { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
        { lastName: { contains: q, mode: Prisma.QueryMode.insensitive } },
        { phone: { contains: q, mode: Prisma.QueryMode.insensitive } },
      ],
    });
  }

  appendStatusFilter(and, query.status);
  appendPackageFilter(and, query.package);
  appendPaymentStatusFilter(and, query.paymentStatus);
  appendTagFilter(and, query.tag);
  appendAttendanceFilter(and, query.attendance);
  appendQuickFilters(and, query.quick);

  if (query.preferredCoachId) {
    and.push({
      bookings: { some: { session: { coachId: query.preferredCoachId } } },
    });
  }

  if (query.source === 'mobile-app') {
    and.push({ bookings: { some: { channel: 'APP' } } });
  } else if (query.source === 'website') {
    and.push({ bookings: { some: { channel: 'WEBSITE' } } });
  } else if (query.source === 'admin') {
    and.push({ bookings: { none: {} } });
  }

  if (query.birthdayMonth !== undefined) {
    and.push({ dateOfBirth: { not: null } });
  }

  if (query.classLevel?.trim()) {
    const level = query.classLevel.trim();
    and.push({
      bookings: {
        some: {
          session: {
            OR: [
              {
                level: { contains: level, mode: Prisma.QueryMode.insensitive },
              },
              {
                classType: {
                  name: { contains: level, mode: Prisma.QueryMode.insensitive },
                },
              },
            ],
          },
        },
      },
    });
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
  packageFilter: AdminClientPackageFilter | undefined,
): void {
  if (!packageFilter || packageFilter === AdminClientPackageFilter.ALL) {
    return;
  }
  if (packageFilter === AdminClientPackageFilter.ACTIVE) {
    and.push({
      userPackages: { some: { status: UserPackageStatus.ACTIVE } },
    });
    return;
  }
  and.push({
    userPackages: { none: { status: UserPackageStatus.ACTIVE } },
  });
}

function appendStatusFilter(
  and: Prisma.UserWhereInput[],
  status: AdminClientStatusFilter | undefined,
): void {
  if (!status) {
    return;
  }
  if (status === AdminClientStatusFilter.BLOCKED) {
    and.push({ isBlocked: true });
    return;
  }
  if (status === AdminClientStatusFilter.FROZEN) {
    and.push({ id: '__frozen-none__' });
    return;
  }
  if (status === AdminClientStatusFilter.ACTIVE) {
    and.push({
      isBlocked: false,
      bookings: { some: activeClientBookingWhere },
    });
    return;
  }
  and.push({
    isBlocked: false,
    NOT: { bookings: { some: activeClientBookingWhere } },
  });
}

function appendPaymentStatusFilter(
  and: Prisma.UserWhereInput[],
  paymentStatus: AdminClientPaymentStatusFilter | undefined,
): void {
  if (!paymentStatus) {
    return;
  }
  if (paymentStatus === AdminClientPaymentStatusFilter.OVERDUE) {
    and.push({ payments: { some: { status: PaymentStatus.FAILED } } });
    return;
  }
  if (paymentStatus === AdminClientPaymentStatusFilter.UNPAID) {
    and.push(unpaidPaymentWhere);
    return;
  }
  if (paymentStatus === AdminClientPaymentStatusFilter.PAID) {
    and.push({ payments: { some: { status: PaymentStatus.SUCCEEDED } } });
  }
}

function appendTagFilter(
  and: Prisma.UserWhereInput[],
  tag: AdminClientTagFilter | undefined,
): void {
  if (!tag) {
    return;
  }
  if (tag === AdminClientTagFilter.NEW) {
    and.push({ createdAt: { gte: newClientThreshold() } });
    return;
  }
  if (tag === AdminClientTagFilter.BEGINNER) {
    and.push({
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
    });
  }
}

function appendAttendanceFilter(
  and: Prisma.UserWhereInput[],
  attendance: AdminClientAttendanceFilter | undefined,
): void {
  if (attendance === AdminClientAttendanceFilter.NO_SHOW) {
    and.push({ bookings: { some: { status: BookingStatus.MISSED } } });
  }
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
