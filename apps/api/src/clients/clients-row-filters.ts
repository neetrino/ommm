import {
  AdminClientQuickFilter,
  AdminClientStatusFilter,
  AdminClientTagFilter,
  AdminClientOrder,
  type AdminListClientsQueryDto,
} from './dto/admin-list-clients-query.dto';
import { INACTIVE_CLIENT_DAYS } from './clients-list.constants';
import {
  type ClientRow,
  type ClientStatus,
  type ClientTag,
} from './clients-row.mapper';

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
