import { ClassSessionStatus } from '@prisma/client';
import type ExcelJS from 'exceljs';
import {
  SCHEDULE_XLSX_COLUMN_COUNT,
  SCHEDULE_XLSX_NUMBER_COLUMNS,
  SCHEDULE_XLSX_STATUS_COLUMN,
} from './classes-sessions-export.constants';

const FONT_NAME = 'Calibri';
const INK = 'FF3D4A38';
const MUTED = 'FF6B6458';
const WHITE = 'FFFFFFFF';
const HEADER_FILL = 'FF5C6B57';
const ZEBRA_FILL = 'FFFBF8F3';
const LINE = 'FFE4DDD2';
const INTEGER_FORMAT = '0';

const THIN_EDGE = { style: 'thin' as const, color: { argb: LINE } };
const TABLE_BORDER = {
  top: THIN_EDGE,
  left: THIN_EDGE,
  bottom: THIN_EDGE,
  right: THIN_EDGE,
};

const STATUS_TONE: Record<ClassSessionStatus, { fill: string; font: string }> =
  {
    ACTIVE: { fill: 'FFD1FAE5', font: 'FF065F46' },
    FULL: { fill: 'FFFFFBEB', font: 'FF78350F' },
    CANCELLED: { fill: 'FFFEE2E2', font: 'FFB91C1C' },
    DRAFT: { fill: 'FFF4EFE6', font: 'FF6B5C4C' },
    FINISHED: { fill: 'FFF3F6F3', font: 'FF4B6358' },
  };

const NUMBER_COLUMNS = new Set<number>(SCHEDULE_XLSX_NUMBER_COLUMNS);

function solidFill(argb: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } };
}

function horizontalFor(column: number): ExcelJS.Alignment['horizontal'] {
  if (NUMBER_COLUMNS.has(column)) {
    return 'right';
  }
  if (column >= 5 && column <= 8) {
    return 'left';
  }
  return 'center';
}

/** Schedule title band across the sheet. */
export function styleScheduleTitleRow(
  sheet: ExcelJS.Worksheet,
  row: ExcelJS.Row,
): void {
  sheet.mergeCells(row.number, 1, row.number, SCHEDULE_XLSX_COLUMN_COUNT);
  row.height = 34;
  const cell = row.getCell(1);
  cell.font = { name: FONT_NAME, size: 18, bold: true, color: { argb: INK } };
  cell.alignment = { vertical: 'middle', horizontal: 'left' };
}

/** Date scope and class count under the title. */
export function styleSchedulePeriodRow(
  sheet: ExcelJS.Worksheet,
  row: ExcelJS.Row,
): void {
  sheet.mergeCells(row.number, 1, row.number, SCHEDULE_XLSX_COLUMN_COUNT);
  row.height = 22;
  const cell = row.getCell(1);
  cell.font = { name: FONT_NAME, size: 12, color: { argb: MUTED } };
  cell.alignment = { vertical: 'middle', horizontal: 'left' };
}

export function styleScheduleHeaderRow(row: ExcelJS.Row): void {
  row.height = 26;
  for (let column = 1; column <= SCHEDULE_XLSX_COLUMN_COUNT; column += 1) {
    styleScheduleHeaderCell(row.getCell(column), column);
  }
}

export function styleScheduleDataRow(
  row: ExcelJS.Row,
  stripe: boolean,
  status: ClassSessionStatus,
): void {
  row.height = 22;
  const tone = STATUS_TONE[status];
  for (let column = 1; column <= SCHEDULE_XLSX_COLUMN_COUNT; column += 1) {
    styleScheduleDataCell(row.getCell(column), column, stripe, tone);
  }
}

function styleScheduleHeaderCell(cell: ExcelJS.Cell, column: number): void {
  cell.font = { name: FONT_NAME, size: 11, bold: true, color: { argb: WHITE } };
  cell.fill = solidFill(HEADER_FILL);
  cell.alignment = {
    vertical: 'middle',
    horizontal: column >= 5 && column <= 8 ? 'left' : 'center',
    wrapText: true,
  };
  cell.border = TABLE_BORDER;
}

function styleScheduleDataCell(
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
  if (NUMBER_COLUMNS.has(column)) {
    cell.numFmt = INTEGER_FORMAT;
  }
  if (column === SCHEDULE_XLSX_STATUS_COLUMN) {
    cell.fill = solidFill(tone.fill);
    cell.font = {
      name: FONT_NAME,
      size: 10,
      bold: true,
      color: { argb: tone.font },
    };
  }
}
