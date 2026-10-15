import {
  exportRangeFileSuffix,
  formatExportDay,
  formatExportDayRange,
  resolveExportLocale,
  type ExportLocale,
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
import type {
  GiftCreditEvent,
  GiftCreditEventType,
} from './reports-gift-credit-events';

type GiftCreditsExportCopy = {
  title: string;
  allTime: string;
  count: (count: number) => string;
  headers: readonly [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  events: Record<GiftCreditEventType, string>;
};

const GIFT_CREDITS_EXPORT_COPY: Record<ExportLocale, GiftCreditsExportCopy> = {
  en: {
    title: 'Gift credits',
    allTime: 'All time',
    count: (count) => `${count} entries`,
    headers: [
      'Event',
      'Date',
      'Time',
      'Client',
      'Email',
      'Amount (AMD)',
      'Reference',
      'Notes',
    ],
    events: { ISSUED: 'Issued', REDEEMED: 'Redeemed', SPENT: 'Spent' },
  },
  hy: {
    title: 'Նվեր կրեդիտներ',
    allTime: 'Ամբողջ ժամանակահատված',
    count: (count) => `${count} գրառում`,
    headers: [
      'Գործողություն',
      'Ամսաթիվ',
      'Ժամ',
      'Հաճախորդ',
      'Էլ. փոստ',
      'Գումար (AMD)',
      'Հղում',
      'Նշումներ',
    ],
    events: { ISSUED: 'Թողարկված', REDEEMED: 'Ակտիվացված', SPENT: 'Ծախսված' },
  },
  ru: {
    title: 'Подарочные кредиты',
    allTime: 'За всё время',
    count: (count) => `Записей: ${count}`,
    headers: [
      'Событие',
      'Дата',
      'Время',
      'Клиент',
      'Email',
      'Сумма (AMD)',
      'Референс',
      'Примечание',
    ],
    events: { ISSUED: 'Выпущен', REDEEMED: 'Активирован', SPENT: 'Списан' },
  },
};

const GIFT_CREDITS_COLUMN_WIDTHS = [14, 13, 9, 24, 28, 14, 24, 32] as const;
const GIFT_CREDITS_AMOUNT_COLUMN_INDEX = 5;

export type GiftCreditsXlsxInput = {
  locale?: string;
  from?: string;
  to?: string;
  events: readonly GiftCreditEvent[];
};

/** Styled .xlsx of gift-credit issue / redeem / spend events, newest first. */
export function buildGiftCreditsXlsx(
  input: GiftCreditsXlsxInput,
): Promise<Buffer> {
  const copy = GIFT_CREDITS_EXPORT_COPY[resolveExportLocale(input.locale)];
  const range = formatExportDayRange(input.from, input.to) ?? copy.allTime;
  const events = [...input.events].sort(
    (left, right) => right.eventAt.getTime() - left.eventAt.getTime(),
  );
  const columns: TableXlsxColumn[] = copy.headers.map((header, index) => ({
    header,
    width: GIFT_CREDITS_COLUMN_WIDTHS[index] ?? GIFT_CREDITS_COLUMN_WIDTHS[0],
    numeric: index === GIFT_CREDITS_AMOUNT_COLUMN_INDEX,
  }));
  return buildTableXlsx({
    sheetName: 'Gift credits',
    title: copy.title,
    subtitle: `${range} · ${copy.count(events.length)}`,
    columns,
    rows: events.map((event) => giftCreditCells(copy, event)),
  });
}

export function giftCreditsExportFilename(from?: string, to?: string): string {
  return `gift-credits-${exportRangeFileSuffix(from, to)}.xlsx`;
}

function giftCreditCells(
  copy: GiftCreditsExportCopy,
  event: GiftCreditEvent,
): TableXlsxCell[] {
  return [
    copy.events[event.eventType],
    formatExportDay(utcToStudioCalendarDate(event.eventAt)),
    utcToStudioWallClockTime(event.eventAt),
    event.userName || null,
    event.userEmail || null,
    event.amountCents,
    event.reference,
    event.notes || null,
  ];
}
