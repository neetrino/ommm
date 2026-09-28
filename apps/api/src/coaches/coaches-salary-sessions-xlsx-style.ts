import type ExcelJS from 'exceljs';
import type { CoachSalarySessionReason } from './coaches-salary-sessions.helpers';

export const SALARY_XLSX_COLUMN_COUNT = 7;

export const SALARY_XLSX_COLUMN_WIDTHS = [32, 16, 12, 16, 18, 18, 24] as const;

/** Thousands grouping with an AMD suffix, so Excel opens the amount as money. */
export const SALARY_XLSX_AMD_FORMAT = '#,##0" ֏"';

const FONT_NAME = 'Calibri';
const INK = 'FF3D4A38';
const MUTED = 'FF6B6458';
const WHITE = 'FFFFFFFF';
const HEADER_FILL = 'FF5C6B57';
const ZEBRA_FILL = 'FFFBF8F3';
const TOTALS_FILL = 'FFF4EFE6';
const LINE = 'FFE4DDD2';
const TOTALS_EDGE = 'FF5C6B57';

const THIN_EDGE = { style: 'thin' as const, color: { argb: LINE } };
const TABLE_BORDER = {
  top: THIN_EDGE,
  left: THIN_EDGE,
  bottom: THIN_EDGE,
  right: THIN_EDGE,
};

const STATUS_TONE: Record<
  CoachSalarySessionReason,
  { fill: string; font: string }
> = {
  PAID: { fill: 'FFD1FAE5', font: 'FF065F46' },
  NOT_FINISHED_YET: { fill: 'FFF3F6F3', font: 'FF4B6358' },
  SESSION_CANCELLED: { fill: 'FFFEE2E2', font: 'FFB91C1C' },
  NO_RATE_CONFIGURED: { fill: 'FFFFFBEB', font: 'FF78350F' },
  NO_BOOKINGS: { fill: 'FFF4EFE6', font: 'FF6B5C4C' },
  NO_SHOW_ONLY: { fill: 'FFFEF2F2', font: 'FF991B1B' },
  PENDING_ACCRUAL: { fill: 'FFFFFBEB', font: 'FF78350F' },
};

function solidFill(argb: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } };
}

function horizontalFor(column: number): ExcelJS.Alignment['horizontal'] {
  if (column === 1) {
    return 'left';
  }
  if (column === 5 || column === 6) {
    return 'right';
  }
  return 'center';
}

/** Coach name band across the sheet. */
export function styleSalaryTitleRow(
  sheet: ExcelJS.Worksheet,
  row: ExcelJS.Row,
): void {
  sheet.mergeCells(row.number, 1, row.number, SALARY_XLSX_COLUMN_COUNT);
  row.height = 34;
  const cell = row.getCell(1);
  cell.font = { name: FONT_NAME, size: 18, bold: true, color: { argb: INK } };
  cell.alignment = { vertical: 'middle', horizontal: 'left' };
}

/** Inclusive period under the coach name. */
export function styleSalaryPeriodRow(
  sheet: ExcelJS.Worksheet,
  row: ExcelJS.Row,
): void {
  sheet.mergeCells(row.number, 1, row.number, SALARY_XLSX_COLUMN_COUNT);
  row.height = 22;
  const cell = row.getCell(1);
  cell.font = { name: FONT_NAME, size: 12, color: { argb: MUTED } };
  cell.alignment = { vertical: 'middle', horizontal: 'left' };
}

export function styleSalaryHeaderRow(row: ExcelJS.Row): void {
  row.height = 26;
  for (let column = 1; column <= SALARY_XLSX_COLUMN_COUNT; column += 1) {
    const cell = row.getCell(column);
    cell.font = {
      name: FONT_NAME,
      size: 11,
      bold: true,
      color: { argb: WHITE },
    };
    cell.fill = solidFill(HEADER_FILL);
    cell.alignment = {
      vertical: 'middle',
      horizontal: column === 1 ? 'left' : 'center',
      wrapText: true,
    };
    cell.border = TABLE_BORDER;
  }
}

export function styleSalaryDataRow(
  row: ExcelJS.Row,
  stripe: boolean,
  reason: CoachSalarySessionReason,
): void {
  row.height = 22;
  const tone = STATUS_TONE[reason];
  for (let column = 1; column <= SALARY_XLSX_COLUMN_COUNT; column += 1) {
    styleSalaryDataCell(row.getCell(column), column, stripe, tone);
  }
}

function styleSalaryDataCell(
  cell: ExcelJS.Cell,
  column: number,
  stripe: boolean,
  tone: { fill: string; font: string },
): void {
  cell.font = { name: FONT_NAME, size: 11, color: { argb: INK } };
  cell.alignment = { vertical: 'middle', horizontal: horizontalFor(column) };
  cell.border = TABLE_BORDER;
  if (stripe) {
    cell.fill = solidFill(ZEBRA_FILL);
  }
  if (column === 5 || column === 6) {
    cell.numFmt = SALARY_XLSX_AMD_FORMAT;
  }
  if (column === 6 && typeof cell.value === 'number') {
    cell.font = {
      name: FONT_NAME,
      size: 11,
      bold: true,
      color: { argb: 'FF14532D' },
    };
  }
  if (column === 7) {
    cell.fill = solidFill(tone.fill);
    cell.font = {
      name: FONT_NAME,
      size: 10,
      bold: true,
      color: { argb: tone.font },
    };
  }
}

export function styleSalaryTotalsRow(row: ExcelJS.Row): void {
  row.height = 26;
  const top = { style: 'medium' as const, color: { argb: TOTALS_EDGE } };
  for (let column = 1; column <= SALARY_XLSX_COLUMN_COUNT; column += 1) {
    const cell = row.getCell(column);
    cell.font = { name: FONT_NAME, size: 11, bold: true, color: { argb: INK } };
    cell.fill = solidFill(TOTALS_FILL);
    cell.alignment = { vertical: 'middle', horizontal: horizontalFor(column) };
    cell.border = { ...TABLE_BORDER, top };
  }
  row.getCell(6).numFmt = SALARY_XLSX_AMD_FORMAT;
}
