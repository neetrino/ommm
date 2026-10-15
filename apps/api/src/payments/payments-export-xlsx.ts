import type { ManualPaymentMethod, PaymentStatus } from '@prisma/client';
import {
  exportRangeFileSuffix,
  formatExportDay,
  formatExportDayRange,
  resolveExportLocale,
} from '../common/xlsx/export-locale';
import {
  utcToStudioCalendarDate,
  utcToStudioWallClockTime,
} from '../common/studio-timezone';
import {
  buildTableXlsx,
  type TableXlsxCell,
  type TableXlsxColumn,
} from '../common/xlsx/table-xlsx';
import {
  PAYMENTS_EXPORT_COPY,
  type PaymentsExportCopy,
} from './payments-export-labels';
import {
  PAYMENTS_XLSX_COLUMN_WIDTHS as WIDTHS,
  PAYMENTS_XLSX_SHEET_NAME,
} from './payments-export.constants';
import type { PaymentListSource } from './payments.types';

export type PaymentsExportRow = {
  createdAt: Date;
  amountCents: number;
  status: PaymentStatus;
  paymentMethod: ManualPaymentMethod | null;
  source: PaymentListSource;
  description: string | null;
  paymentReference: string | null;
  id: string;
  relatedItemName: string | null;
  relatedItemGroupName: string | null;
  user: {
    email: string;
    name: string | null;
    lastName: string | null;
    phone: string | null;
  };
};

export type PaymentsXlsxInput = {
  locale?: string;
  from?: string;
  to?: string;
  items: readonly PaymentsExportRow[];
};

/** Styled .xlsx of the admin payments that match the current finance filters. */
export function buildPaymentsXlsx(input: PaymentsXlsxInput): Promise<Buffer> {
  const copy = PAYMENTS_EXPORT_COPY[resolveExportLocale(input.locale)];
  return buildTableXlsx({
    sheetName: PAYMENTS_XLSX_SHEET_NAME,
    title: copy.title,
    subtitle: paymentsSubtitle(copy, input),
    columns: paymentsColumns(copy),
    rows: input.items.map((item) => paymentCells(copy, item)),
  });
}

export function paymentsExportFilename(from?: string, to?: string): string {
  return `payments-${exportRangeFileSuffix(from, to)}.xlsx`;
}

function paymentsSubtitle(
  copy: PaymentsExportCopy,
  input: PaymentsXlsxInput,
): string {
  const range = formatExportDayRange(input.from, input.to) ?? copy.allTime;
  const total = input.items.reduce((sum, item) => sum + item.amountCents, 0);
  return `${range} · ${copy.count(input.items.length)} · ${copy.total}: ${formatAmd(total)} AMD`;
}

function paymentsColumns(copy: PaymentsExportCopy): TableXlsxColumn[] {
  return [
    { header: copy.date, width: WIDTHS.date },
    { header: copy.time, width: WIDTHS.time },
    { header: copy.client, width: WIDTHS.client },
    { header: copy.email, width: WIDTHS.email },
    { header: copy.phone, width: WIDTHS.phone },
    { header: copy.amount, width: WIDTHS.amount, numeric: true },
    { header: copy.status, width: WIDTHS.status },
    { header: copy.method, width: WIDTHS.method },
    { header: copy.source, width: WIDTHS.source },
    { header: copy.item, width: WIDTHS.item },
    { header: copy.description, width: WIDTHS.description },
    { header: copy.reference, width: WIDTHS.reference },
  ];
}

function paymentCells(
  copy: PaymentsExportCopy,
  item: PaymentsExportRow,
): TableXlsxCell[] {
  return [
    formatExportDay(utcToStudioCalendarDate(item.createdAt)),
    utcToStudioWallClockTime(item.createdAt),
    personName(item.user.name, item.user.lastName),
    item.user.email,
    item.user.phone,
    item.amountCents,
    copy.statuses[item.status],
    item.paymentMethod ? copy.methods[item.paymentMethod] : null,
    copy.sources[item.source],
    relatedItemLabel(item),
    item.description,
    item.paymentReference ?? item.id,
  ];
}

function relatedItemLabel(item: PaymentsExportRow): string | null {
  if (!item.relatedItemName) {
    return null;
  }
  return item.relatedItemGroupName
    ? `${item.relatedItemGroupName} · ${item.relatedItemName}`
    : item.relatedItemName;
}

function personName(name: string | null, lastName: string | null): string {
  return [name, lastName]
    .map((part) => part?.trim() ?? '')
    .filter((part) => part.length > 0)
    .join(' ');
}

function formatAmd(amount: number): string {
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
