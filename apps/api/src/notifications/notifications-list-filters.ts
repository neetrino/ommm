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

export function requiresScheduledPostProcessing(
  query: AdminListScheduledQueryDto,
): boolean {
  return Boolean(
    query.search?.trim() ||
      query.status ||
      query.audience ||
      query.quick ||
      (query.order && query.order !== 'newest'),
  );
}

export function filterScheduledRows(
  rows: ScheduledRow[],
  query: AdminListScheduledQueryDto,
): ScheduledRow[] {
  const needle = query.search?.trim().toLowerCase() ?? '';
  let filtered = rows.filter((row) => {
    if (needle !== '' && !`${row.subject} ${row.html}`.toLowerCase().includes(needle)) {
      return false;
    }
    if (query.status && row.status !== query.status) {
      return false;
    }
    if (query.audience && row.audience !== query.audience) {
      return false;
    }
    if (query.quick === 'pending' && row.status !== 'PENDING') return false;
    if (query.quick === 'failed' && row.status !== 'FAILED') return false;
    if (query.quick === 'sent' && row.status !== 'SENT') return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (query.order === 'schedule') {
      return new Date(a.scheduleAt).getTime() - new Date(b.scheduleAt).getTime();
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
      query.audience ||
      query.channel ||
      query.timing ||
      query.quick ||
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
      const haystack = `${row.subject} ${row.recipientEmail} ${row.channel}`.toLowerCase();
      if (!haystack.includes(needle)) {
        return false;
      }
    }
    if (query.audience && row.audience !== query.audience) {
      return false;
    }
    if (query.channel && row.channel !== query.channel) {
      return false;
    }
    if (query.timing === 'scheduled' && !row.scheduled) return false;
    if (query.timing === 'immediate' && row.scheduled) return false;
    if (query.quick === 'scheduled' && !row.scheduled) return false;
    if (query.quick === 'immediate' && row.scheduled) return false;
    if (query.quick === 'sent-today' && !isToday(row.createdAt)) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return query.order === 'oldest' ? aTime - bTime : bTime - aTime;
  });

  return filtered;
}

export function defaultNotificationsTake(query: {
  take?: number;
}): number {
  return query.take ?? DEFAULT_LIST_PAGE_SIZE;
}
