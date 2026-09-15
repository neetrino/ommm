import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import type { AdminListDeliveriesQueryDto } from './dto/admin-list-deliveries-query.dto';
import type { AdminListScheduledQueryDto } from './dto/admin-list-scheduled-query.dto';

export const NOTIFICATIONS_FILTER_SCAN_LIMIT = 2000;

type ScheduledRow = {
  id: string;
  status: string;
  subject: string;
  html: string;
  audience: string;
  scheduleAt: string;
  createdAt: string;
};

type DeliveryRow = {
  id: string;
  createdAt: string;
  recipientEmail: string;
  channel: string;
  audience: string;
  subject: string;
  scheduled: boolean;
};

function isToday(iso: string): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function hasFilterValues(values: readonly unknown[] | undefined): boolean {
  return Boolean(values && values.length > 0);
}

function matchesScheduledQuick(
  row: ScheduledRow,
  quick: NonNullable<AdminListScheduledQueryDto['quick']>[number],
): boolean {
  if (quick === 'pending') {
    return row.status === 'PENDING';
  }
  if (quick === 'failed') {
    return row.status === 'FAILED';
  }
  return row.status === 'SENT';
}

function matchesDeliveryTiming(
  row: DeliveryRow,
  timing: NonNullable<AdminListDeliveriesQueryDto['timing']>[number],
): boolean {
  if (timing === 'scheduled') {
    return row.scheduled;
  }
  return !row.scheduled;
}

function matchesDeliveryQuick(
  row: DeliveryRow,
  quick: NonNullable<AdminListDeliveriesQueryDto['quick']>[number],
): boolean {
  if (quick === 'scheduled') {
    return row.scheduled;
  }
  if (quick === 'immediate') {
    return !row.scheduled;
  }
  return isToday(row.createdAt);
}

export function requiresScheduledPostProcessing(
  query: AdminListScheduledQueryDto,
): boolean {
  return Boolean(
    query.search?.trim() ||
      hasFilterValues(query.status) ||
      hasFilterValues(query.audience) ||
      hasFilterValues(query.quick) ||
      (query.order && query.order !== 'newest'),
  );
}

export function filterScheduledRows(
  rows: ScheduledRow[],
  query: AdminListScheduledQueryDto,
): ScheduledRow[] {
  const needle = query.search?.trim().toLowerCase() ?? '';
  let filtered = rows.filter((row) => {
    if (
      needle !== '' &&
      !`${row.subject} ${row.html}`.toLowerCase().includes(needle)
    ) {
      return false;
    }
    if (
      hasFilterValues(query.status) &&
      !query.status!.some((status) => status === row.status)
    ) {
      return false;
    }
    if (
      hasFilterValues(query.audience) &&
      !query.audience!.some((audience) => audience === row.audience)
    ) {
      return false;
    }
    if (hasFilterValues(query.quick)) {
      const matchesQuick = query.quick!.some((quick) =>
        matchesScheduledQuick(row, quick),
      );
      if (!matchesQuick) {
        return false;
      }
    }
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (query.order === 'schedule') {
      return (
        new Date(a.scheduleAt).getTime() - new Date(b.scheduleAt).getTime()
      );
    }
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return query.order === 'oldest' ? aTime - bTime : bTime - aTime;
  });

  return filtered;
}

export function paginateFilteredRows<T>(
  rows: T[],
  take: number,
  offset: number,
): { items: T[]; total: number; take: number; offset: number } {
  return {
    items: rows.slice(offset, offset + take),
    total: rows.length,
    take,
    offset,
  };
}

export function requiresDeliveriesPostProcessing(
  query: AdminListDeliveriesQueryDto,
): boolean {
  return Boolean(
    query.search?.trim() ||
      hasFilterValues(query.audience) ||
      hasFilterValues(query.channel) ||
      hasFilterValues(query.timing) ||
      hasFilterValues(query.quick) ||
      (query.order && query.order !== 'newest'),
  );
}

export function filterDeliveryRows(
  rows: DeliveryRow[],
  query: AdminListDeliveriesQueryDto,
): DeliveryRow[] {
  const needle = query.search?.trim().toLowerCase() ?? '';
  let filtered = rows.filter((row) => {
    if (needle !== '') {
      const haystack =
        `${row.subject} ${row.recipientEmail} ${row.channel}`.toLowerCase();
      if (!haystack.includes(needle)) {
        return false;
      }
    }
    if (
      hasFilterValues(query.audience) &&
      !query.audience!.some((audience) => audience === row.audience)
    ) {
      return false;
    }
    if (
      hasFilterValues(query.channel) &&
      !query.channel!.some((channel) => channel === row.channel)
    ) {
      return false;
    }
    if (hasFilterValues(query.timing)) {
      const matchesTiming = query.timing!.some((timing) =>
        matchesDeliveryTiming(row, timing),
      );
      if (!matchesTiming) {
        return false;
      }
    }
    if (hasFilterValues(query.quick)) {
      const matchesQuick = query.quick!.some((quick) =>
        matchesDeliveryQuick(row, quick),
      );
      if (!matchesQuick) {
        return false;
      }
    }
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return query.order === 'oldest' ? aTime - bTime : bTime - aTime;
  });

  return filtered;
}

export function defaultNotificationsTake(query: { take?: number }): number {
  return query.take ?? DEFAULT_LIST_PAGE_SIZE;
}
