import ExcelJS from 'exceljs';
import {
  COACH_SALARY_XLSX_FIRST_DATA_ROW,
  COACH_SALARY_XLSX_HEADER_ROW,
  COACH_SALARY_XLSX_SALARY_COLUMN,
  COACH_SALARY_XLSX_SHEET_NAME,
} from './coaches-salary-export.constants';
import {
  coachSalaryExportCopy,
  type CoachSalaryExportCopy,
} from './coaches-salary-export-labels';
import {
  coachSalaryExportSessionCells,
  formatCoachSalaryExportDay,
} from './coaches-salary-export-rows';
import type { CoachSalarySessionRow } from './coaches-salary-sessions.helpers';

const COLUMN_WIDTHS = [28, 16, 12, 16, 16, 16, 22] as const;
const AMD_NUMBER_FORMAT = '#,##0';
const HEADER_FILL = 'FFF4EFE6';
const TOTALS_FILL = 'FFF7F1E8';

export type CoachSalaryXlsxInput = {
  coachName: string;
  from: string;
  to: string;
  locale?: string;
  items: CoachSalarySessionRow[];
};

/** Real .xlsx workbook for one coach and one inclusive date range. */
export async function buildCoachSalarySessionsXlsx(
  input: CoachSalaryXlsxInput,
): Promise<Buffer> {
  const copy = coachSalaryExportCopy(input.locale);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Ommm';
  const sheet = workbook.addWorksheet(COACH_SALARY_XLSX_SHEET_NAME);
  addMetaRows(sheet, input, copy);
  addHeaderRow(sheet, copy);
  addSessionRows(sheet, input.items);
  addTotalsRow(sheet, input.items.length, copy);
  applySheetLayout(sheet, input.items.length);
  const raw = await workbook.xlsx.writeBuffer();
  return Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
}

function addMetaRows(
  sheet: ExcelJS.Worksheet,
  input: CoachSalaryXlsxInput,
  copy: CoachSalaryExportCopy,
): void {
  sheet.addRow([copy.coach, input.coachName]);
  sheet.addRow([copy.from, formatCoachSalaryExportDay(input.from)]);
  sheet.addRow([copy.to, formatCoachSalaryExportDay(input.to)]);
  sheet.addRow([]);
  sheet.getRow(1).font = { bold: true };
}

function addHeaderRow(
  sheet: ExcelJS.Worksheet,
  copy: CoachSalaryExportCopy,
): void {
  const header = sheet.addRow([
    copy.className,
    copy.lessonDate,
    copy.time,
    copy.attendance,
    copy.rate,
    copy.salary,
    copy.status,
  ]);
  header.font = { bold: true };
  header.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: HEADER_FILL },
    };
  });
}

function addSessionRows(
  sheet: ExcelJS.Worksheet,
  items: CoachSalarySessionRow[],
): void {
  items.forEach((item) => {
    const row = sheet.addRow(coachSalaryExportSessionCells(item));
    row.getCell(5).numFmt = AMD_NUMBER_FORMAT;
    row.getCell(6).numFmt = AMD_NUMBER_FORMAT;
  });
}

function addTotalsRow(
  sheet: ExcelJS.Worksheet,
  itemCount: number,
  copy: CoachSalaryExportCopy,
): void {
  const lastDataRow =
    COACH_SALARY_XLSX_FIRST_DATA_ROW + Math.max(itemCount, 1) - 1;
  const salaryTotal =
    itemCount === 0
      ? 0
      : {
          formula: `SUM(${COACH_SALARY_XLSX_SALARY_COLUMN}${COACH_SALARY_XLSX_FIRST_DATA_ROW}:${COACH_SALARY_XLSX_SALARY_COLUMN}${lastDataRow})`,
        };
  const totals = sheet.addRow([
    copy.totals,
    null,
    null,
    null,
    null,
    salaryTotal,
    null,
  ]);
  totals.font = { bold: true };
  totals.getCell(6).numFmt = AMD_NUMBER_FORMAT;
  for (let column = 1; column <= COLUMN_WIDTHS.length; column += 1) {
    totals.getCell(column).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: TOTALS_FILL },
    };
  }
}

function applySheetLayout(sheet: ExcelJS.Worksheet, itemCount: number): void {
  COLUMN_WIDTHS.forEach((width, index) => {
    sheet.getColumn(index + 1).width = width;
  });
  const lastRow = COACH_SALARY_XLSX_HEADER_ROW + itemCount;
  sheet.autoFilter = {
    from: { row: COACH_SALARY_XLSX_HEADER_ROW, column: 1 },
    to: {
      row: Math.max(lastRow, COACH_SALARY_XLSX_HEADER_ROW),
      column: COLUMN_WIDTHS.length,
    },
  };
  sheet.views = [{ state: 'frozen', ySplit: COACH_SALARY_XLSX_HEADER_ROW }];
}
