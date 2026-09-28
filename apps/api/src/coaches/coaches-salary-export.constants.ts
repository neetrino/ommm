/** Inclusive studio days allowed in one coach salary workbook. */
export const COACH_SALARY_EXPORT_MAX_INCLUSIVE_DAYS = 366;

/** Hard cap so one workbook cannot load an unbounded session history. */
export const COACH_SALARY_EXPORT_MAX_ROWS = 5000;

export const COACH_SALARY_XLSX_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export const COACH_SALARY_EXPORT_INVALID_RANGE = 'Invalid date range';

export const COACH_SALARY_EXPORT_RANGE_TOO_LONG = 'Date range is too long';

export const COACH_SALARY_EXPORT_TOO_MANY_ROWS =
  'Too many sessions in this range';

export const COACH_SALARY_XLSX_HEADER_ROW = 5;

export const COACH_SALARY_XLSX_FIRST_DATA_ROW = 6;

export const COACH_SALARY_XLSX_SALARY_COLUMN = 'F';

export const COACH_SALARY_XLSX_SHEET_NAME = 'Salary';

const MS_PER_DAY = 86_400_000;

/** Inclusive day count for `YYYY-MM-DD` bounds. Returns 0 when a bound is not a calendar day. */
export function coachSalaryExportInclusiveDaySpan(
  from: string,
  to: string,
): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return 0;
  }
  const start = Date.parse(`${from}T00:00:00.000Z`);
  const end = Date.parse(`${to}T00:00:00.000Z`);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return 0;
  }
  return Math.floor((end - start) / MS_PER_DAY) + 1;
}
