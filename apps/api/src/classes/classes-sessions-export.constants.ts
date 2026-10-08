/** Hard cap so one workbook cannot load an unbounded session history. */
export const SCHEDULE_EXPORT_MAX_ROWS = 5000;

export const SCHEDULE_EXPORT_TOO_MANY = 'schedule_export_too_many';

export const SCHEDULE_XLSX_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export const SCHEDULE_XLSX_SHEET_NAME = 'Schedule';

/** Title, period, spacer, then the column header. */
export const SCHEDULE_XLSX_HEADER_ROW = 4;

export const SCHEDULE_XLSX_COLUMN_COUNT = 12;

export const SCHEDULE_XLSX_COLUMN_WIDTHS = [
  14, 16, 10, 10, 28, 22, 22, 18, 12, 12, 12, 16,
] as const;

/** Booked, capacity, and spots-left columns (1-based). */
export const SCHEDULE_XLSX_NUMBER_COLUMNS = [9, 10, 11] as const;

export const SCHEDULE_XLSX_STATUS_COLUMN = 12;
