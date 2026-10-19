/** Hard cap so one workbook cannot load an unbounded payments ledger. */
export const PAYMENTS_EXPORT_MAX_ROWS = 10_000;

export const PAYMENTS_EXPORT_TOO_MANY = 'payments_export_too_many';

export const PAYMENTS_XLSX_SHEET_NAME = 'Payments';

export const PAYMENTS_XLSX_COLUMN_WIDTHS = {
  date: 14,
  time: 9,
  paidDate: 14,
  paidTime: 9,
  client: 24,
  email: 28,
  phone: 16,
  amount: 14,
  status: 14,
  method: 16,
  source: 14,
  item: 28,
  description: 36,
  reference: 22,
} as const;
