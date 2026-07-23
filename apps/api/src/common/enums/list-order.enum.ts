export enum DateListOrder {
  NEWEST = 'newest',
  OLDEST = 'oldest',
}

export enum SessionListOrder {
  UPCOMING = 'upcoming',
  DATE_ASC = 'date-asc',
  DATE_DESC = 'date-desc',
}

export enum BookingManagementOrder {
  UPCOMING = 'upcoming',
  DATE_ASC = 'date-asc',
  DATE_DESC = 'date-desc',
  NEWEST = 'newest',
  OLDEST = 'oldest',
}

export function resolveDateListPrismaOrder(
  order: DateListOrder | undefined,
): 'asc' | 'desc' {
  return order === DateListOrder.OLDEST ? 'asc' : 'desc';
}

export function resolveSessionListPrismaOrder(
  order: SessionListOrder | undefined,
): 'asc' | 'desc' {
  if (order === SessionListOrder.DATE_DESC) {
    return 'desc';
  }
  return 'asc';
}
