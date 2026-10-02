import ExcelJS from 'exceljs';
import {
  COACH_SALARY_XLSX_FIRST_DATA_ROW,
  COACH_SALARY_XLSX_HEADER_ROW,
  COACH_SALARY_XLSX_SALARY_COLUMN,
  COACH_SALARY_XLSX_SHEET_NAME,
} from './coaches-salary-export.constants';
import { coachSalaryExportCopy } from './coaches-salary-export-labels';
import {
  coachSalaryExportSessionCells,
  formatCoachSalaryExportDay,
} from './coaches-salary-export-rows';
import type { CoachSalarySessionRow } from './coaches-salary-sessions.helpers';
import {
  SALARY_XLSX_COLUMN_COUNT,
  SALARY_XLSX_COLUMN_WIDTHS,
  styleSalaryDataRow,
  styleSalaryHeaderRow,
  styleSalaryPeriodRow,
  styleSalaryTitleRow,
  styleSalaryTotalsRow,
} from './coaches-salary-sessions-xlsx-style';

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
  workbook.calcProperties.fullCalcOnLoad = true;
  const sheet = workbook.addWorksheet(COACH_SALARY_XLSX_SHEET_NAME, {
    properties: { tabColor: { argb: 'FF5C6B57' } },
    views: [{ showGridLines: false }],
  });
  styleSalaryTitleRow(sheet, sheet.addRow([input.coachName]));
  styleSalaryPeriodRow(
    sheet,
    sheet.addRow([formatSalaryPeriod(input.from, input.to)]),
  );
  const spacer = sheet.addRow([]);
  spacer.height = 10;
  const header = sheet.addRow([
    copy.className,
    copy.lessonDate,
    copy.time,
    copy.attendance,
    copy.rate,
    copy.salary,
    copy.status,
  ]);
  styleSalaryHeaderRow(header);
  input.items.forEach((item, index) => {
    const row = sheet.addRow(coachSalaryExportSessionCells(item));
    styleSalaryDataRow(row, index % 2 === 1, item.reason);
  });
  const totals = sheet.addRow(totalsCells(input.items.length, copy.totals));
  styleSalaryTotalsRow(totals);
  applySheetLayout(sheet, input.items.length);
  const raw = await workbook.xlsx.writeBuffer();
  return Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
}

function formatSalaryPeriod(from: string, to: string): string {
  const start = formatCoachSalaryExportDay(from);
  const end = formatCoachSalaryExportDay(to);
  return start === end ? start : `${start} – ${end}`;
}

function totalsCells(itemCount: number, label: string): ExcelJS.CellValue[] {
  const lastDataRow =
    COACH_SALARY_XLSX_FIRST_DATA_ROW + Math.max(itemCount, 1) - 1;
  const salaryTotal =
    itemCount === 0
      ? 0
      : {
          formula: `SUM(${COACH_SALARY_XLSX_SALARY_COLUMN}${COACH_SALARY_XLSX_FIRST_DATA_ROW}:${COACH_SALARY_XLSX_SALARY_COLUMN}${lastDataRow})`,
        };
  return [label, null, null, null, null, salaryTotal, null];
}

function applySheetLayout(sheet: ExcelJS.Worksheet, itemCount: number): void {
  SALARY_XLSX_COLUMN_WIDTHS.forEach((width, index) => {
    sheet.getColumn(index + 1).width = width;
  });
  const lastDataRow = COACH_SALARY_XLSX_HEADER_ROW + Math.max(itemCount, 0);
  sheet.autoFilter = {
    from: { row: COACH_SALARY_XLSX_HEADER_ROW, column: 1 },
    to: { row: lastDataRow, column: SALARY_XLSX_COLUMN_COUNT },
  };
  sheet.views = [
    {
      state: 'frozen',
      ySplit: COACH_SALARY_XLSX_HEADER_ROW,
      showGridLines: false,
    },
  ];
  sheet.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9,
    printTitlesRow: `1:${COACH_SALARY_XLSX_HEADER_ROW}`,
  };
}
