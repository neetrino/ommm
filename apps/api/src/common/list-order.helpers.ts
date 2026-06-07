import {
  BookingManagementOrder,
  DateListOrder,
  SessionListOrder,
  resolveDateListPrismaOrder,
  resolveSessionListPrismaOrder,
} from './enums/list-order.enum';

type SessionStartsAtRow = { session: { startsAt: Date | string } };

type RegisterDateRow = SessionStartsAtRow & { registerDate?: string; createdAt?: Date };

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

function localIsoDay(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayLocalIsoDay(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return localIsoDay(now);
}

function compareSessionStartsAtValues(
  left: Date | string,
  right: Date | string,
  order: SessionListOrder,
): number {
  const leftIso = toIso(left);
  const rightIso = toIso(right);
  if (order === SessionListOrder.DATE_DESC) {
    return rightIso.localeCompare(leftIso);
  }
  if (order === SessionListOrder.DATE_ASC) {
    return leftIso.localeCompare(rightIso);
  }
  const todayKey = todayLocalIsoDay();
  const leftDay = localIsoDay(left);
  const rightDay = localIsoDay(right);
  const leftIsPast = leftDay < todayKey;
  const rightIsPast = rightDay < todayKey;
  if (leftIsPast !== rightIsPast) {
    return leftIsPast ? 1 : -1;
  }
  return leftIso.localeCompare(rightIso);
}

export function sortRowsBySessionStartsAt<T extends SessionStartsAtRow>(
  rows: readonly T[],
  order: SessionListOrder = SessionListOrder.UPCOMING,
): T[] {
  return [...rows].sort((left, right) =>
    compareSessionStartsAtValues(
      left.session.startsAt,
      right.session.startsAt,
      order,
    ),
  );
}

export function sortAdminSessionRows<T extends { startsAt: Date | string }>(
  rows: readonly T[],
  order: SessionListOrder = SessionListOrder.UPCOMING,
): T[] {
  return [...rows].sort((left, right) =>
    compareSessionStartsAtValues(left.startsAt, right.startsAt, order),
  );
}

export function sortBookingManagementRows<
  T extends SessionStartsAtRow & { registerDate: string },
>(rows: readonly T[], order: BookingManagementOrder = BookingManagementOrder.UPCOMING): T[] {
  const copy = [...rows];
  copy.sort((left, right) => {
    if (
      order === BookingManagementOrder.NEWEST ||
      order === BookingManagementOrder.OLDEST
    ) {
      const direction = resolveDateListPrismaOrder(
        order === BookingManagementOrder.OLDEST
          ? DateListOrder.OLDEST
          : DateListOrder.NEWEST,
      );
      const diff = left.registerDate.localeCompare(right.registerDate);
      return direction === 'asc' ? diff : -diff;
    }
    const sessionOrder =
      order === BookingManagementOrder.DATE_DESC
        ? SessionListOrder.DATE_DESC
        : order === BookingManagementOrder.DATE_ASC
          ? SessionListOrder.DATE_ASC
          : SessionListOrder.UPCOMING;
    return compareSessionStartsAtValues(
      left.session.startsAt,
      right.session.startsAt,
      sessionOrder,
    );
  });
  return copy;
}

export function resolveWaitlistAdminOrderBy(
  order: DateListOrder | SessionListOrder | undefined,
): { createdAt: 'asc' | 'desc' } | { session: { startsAt: 'asc' | 'desc' } } {
  if (
    order === SessionListOrder.UPCOMING ||
    order === SessionListOrder.DATE_ASC ||
    order === SessionListOrder.DATE_DESC
  ) {
    return {
      session: {
        startsAt: resolveSessionListPrismaOrder(order),
      },
    };
  }
  return { createdAt: resolveDateListPrismaOrder(order) };
}

export function resolveSessionListOrderBy(order: SessionListOrder | undefined): {
  startsAt: 'asc' | 'desc';
} {
  return { startsAt: resolveSessionListPrismaOrder(order) };
}

export function resolveBookingSessionOrderBy(order: SessionListOrder | undefined): {
  session: { startsAt: 'asc' | 'desc' };
} {
  return { session: { startsAt: resolveSessionListPrismaOrder(order) } };
}

export {
  resolveDateListPrismaOrder,
  resolveSessionListPrismaOrder,
  SessionListOrder,
  DateListOrder,
  BookingManagementOrder,
};
