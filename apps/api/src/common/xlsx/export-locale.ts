export const EXPORT_LOCALES = ['en', 'hy', 'ru'] as const;

export type ExportLocale = (typeof EXPORT_LOCALES)[number];

export function resolveExportLocale(locale: string | undefined): ExportLocale {
  if (locale === 'hy' || locale === 'ru') {
    return locale;
  }
  return 'en';
}

/** `DD/MM/YYYY – DD/MM/YYYY` for inclusive `YYYY-MM-DD` bounds; null when unbounded. */
export function formatExportDayRange(
  from?: string,
  to?: string,
): string | null {
  const start = exportCalendarDay(from);
  const end = exportCalendarDay(to);
  if (start && end) {
    const startLabel = formatExportDay(start);
    const endLabel = formatExportDay(end);
    return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
  }
  if (start) {
    return `${formatExportDay(start)} –`;
  }
  if (end) {
    return `– ${formatExportDay(end)}`;
  }
  return null;
}

/** `DD/MM/YYYY` for a `YYYY-MM-DD` studio day. */
export function formatExportDay(isoDay: string): string {
  const [year, month, day] = isoDay.split('-');
  if (!year || !month || !day) {
    return isoDay;
  }
  return `${day}/${month}/${year}`;
}

/** File-name suffix such as `2026-10-01_2026-10-31`, or `all`. */
export function exportRangeFileSuffix(from?: string, to?: string): string {
  const start = exportCalendarDay(from);
  const end = exportCalendarDay(to);
  if (start && end) {
    return start === end ? start : `${start}_${end}`;
  }
  if (start) {
    return `from-${start}`;
  }
  if (end) {
    return `to-${end}`;
  }
  return 'all';
}

function exportCalendarDay(value: string | undefined): string | null {
  const day = value?.slice(0, 10) ?? '';
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}
