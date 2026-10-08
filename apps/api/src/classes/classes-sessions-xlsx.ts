import ExcelJS from 'exceljs';
import {
  SCHEDULE_XLSX_COLUMN_COUNT,
  SCHEDULE_XLSX_COLUMN_WIDTHS,
  SCHEDULE_XLSX_HEADER_ROW,
  SCHEDULE_XLSX_SHEET_NAME,
} from './classes-sessions-export.constants';
import { scheduleExportCopy } from './classes-sessions-export-labels';
import {
  formatScheduleExportPeriod,
  scheduleExportHeaderCells,
  scheduleExportSessionCells,
  type ScheduleExportSession,
} from './classes-sessions-export-rows';
import {
  styleScheduleDataRow,
  styleScheduleHeaderRow,
  styleSchedulePeriodRow,
  styleScheduleTitleRow,
} from './classes-sessions-xlsx-style';

export type ScheduleXlsxInput = {
  locale?: string;
  from?: string;
  to?: string;
  items: ScheduleExportSession[];
};

/** Styled .xlsx of the admin schedule rows that match the current filters. */
export async function buildScheduleSessionsXlsx(
  input: ScheduleXlsxInput,
): Promise<Buffer> {
  const copy = scheduleExportCopy(input.locale);
  const workbook = createScheduleWorkbook();
  const sheet = workbook.addWorksheet(SCHEDULE_XLSX_SHEET_NAME, {
    properties: { tabColor: { argb: 'FF5C6B57' } },
    views: [{ showGridLines: false }],
  });
  styleScheduleTitleRow(sheet, sheet.addRow([copy.title]));
  styleSchedulePeriodRow(
    sheet,
    sheet.addRow([
      formatScheduleExportPeriod({
        locale: input.locale,
        from: input.from,
        to: input.to,
        count: input.items.length,
      }),
    ]),
  );
  const spacer = sheet.addRow([]);
  spacer.height = 10;
  styleScheduleHeaderRow(sheet.addRow(scheduleExportHeaderCells(copy)));
  writeScheduleDataRows(sheet, input.items, input.locale);
  applyScheduleSheetLayout(sheet, input.items.length);
  return workbookToBuffer(workbook);
}

function createScheduleWorkbook(): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Ommm';
  workbook.created = new Date();
  return workbook;
}

function writeScheduleDataRows(
  sheet: ExcelJS.Worksheet,
  items: readonly ScheduleExportSession[],
  locale: string | undefined,
): void {
  items.forEach((item, index) => {
    const row = sheet.addRow(scheduleExportSessionCells(item, locale));
    styleScheduleDataRow(row, index % 2 === 1, item.status);
  });
}

function applyScheduleSheetLayout(
  sheet: ExcelJS.Worksheet,
  itemCount: number,
): void {
  SCHEDULE_XLSX_COLUMN_WIDTHS.forEach((width, index) => {
    sheet.getColumn(index + 1).width = width;
  });
  const lastRow = SCHEDULE_XLSX_HEADER_ROW + Math.max(itemCount, 0);
  sheet.autoFilter = {
    from: { row: SCHEDULE_XLSX_HEADER_ROW, column: 1 },
    to: {
      row: Math.max(lastRow, SCHEDULE_XLSX_HEADER_ROW),
      column: SCHEDULE_XLSX_COLUMN_COUNT,
    },
  };
  sheet.views = [
    {
      state: 'frozen',
      ySplit: SCHEDULE_XLSX_HEADER_ROW,
      showGridLines: false,
    },
  ];
  sheet.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9,
    printTitlesRow: `1:${SCHEDULE_XLSX_HEADER_ROW}`,
  };
}

async function workbookToBuffer(workbook: ExcelJS.Workbook): Promise<Buffer> {
  const raw = await workbook.xlsx.writeBuffer();
  return Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
}
