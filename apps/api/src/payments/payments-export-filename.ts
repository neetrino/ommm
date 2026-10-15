import {
  exportRangeFileSuffix,
  resolveExportLocale,
} from '../common/xlsx/export-locale';
import type { AdminListPaymentsQueryDto } from './dto/admin-list-payments-query.dto';
import {
  PAYMENTS_EXPORT_COPY,
  type PaymentsExportCopy,
} from './payments-export-labels';

/** Keeps long multi-filter names within common OS path limits. */
const FILENAME_BASE_MAX_LENGTH = 150;
const FORBIDDEN_FILENAME_CHARS = /[<>:"/\\|?*\p{Cc}]+/gu;

export type PaymentsExportFilenameInput = {
  locale?: string;
  query: AdminListPaymentsQueryDto;
  /** Display names for `query.planId`. */
  planNames: readonly string[];
};

/** `Payments_2026-10-01_2026-10-31_Succeeded_Cash.xlsx` — period plus every active filter. */
export function paymentsExportFilename(
  input: PaymentsExportFilenameInput,
): string {
  const copy = PAYMENTS_EXPORT_COPY[resolveExportLocale(input.locale)];
  const { from, to } = input.query;
  const parts = [
    copy.title,
    from || to ? exportRangeFileSuffix(from, to) : '',
    ...paymentsFilterLabels(copy, input),
  ]
    .map(sanitizeFilenamePart)
    .filter((part) => part.length > 0);
  const base = parts
    .join('_')
    .slice(0, FILENAME_BASE_MAX_LENGTH)
    .replace(/_+$/, '');
  return `${base}.xlsx`;
}

function paymentsFilterLabels(
  copy: PaymentsExportCopy,
  { query, planNames }: PaymentsExportFilenameInput,
): string[] {
  return [
    ...(query.status ?? []).map((status) => copy.statuses[status]),
    ...(query.source ?? []).map((source) => copy.sources[source]),
    ...(query.paymentMethod ?? []).map((method) => copy.methods[method]),
    ...planNames,
    ...(query.packageClass ?? []),
    ...(query.sessions ?? []).map((sessions) =>
      sessions === 'unlimited'
        ? copy.sessionsUnlimited
        : copy.sessionsCount(sessions),
    ),
    query.q?.trim() ?? '',
  ];
}

function sanitizeFilenamePart(value: string): string {
  return value
    .replace(FORBIDDEN_FILENAME_CHARS, ' ')
    .trim()
    .replace(/\s+/g, '-');
}
