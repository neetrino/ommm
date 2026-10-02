import ExcelJS from 'exceljs';
import {
  GIFT_CARD_IMPORT_HEADERS,
  type GiftImportCell,
} from './gift-card-excel';

export const GIFT_XLSX_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export type IssuedGiftExportRow = {
  code: string;
  status: string;
  balanceAmd: number;
  balanceClasses: number;
  recipientEmail: string | null;
  redeemedAt: Date | null;
  expiresAt: Date | null;
};

const ISSUED_HEADERS = [
  'code',
  'status',
  'balanceAmd',
  'balanceClasses',
  'recipientEmail',
  'redeemedAt',
  'expiresAt',
] as const;

export async function readGiftImportMatrix(buffer: Buffer): Promise<GiftImportCell[][]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(toExcelBuffer(buffer));
  const sheet = workbook.worksheets[0];
  if (sheet === undefined) {
    return [];
  }
  return sheetToMatrix(sheet);
}

export async function buildGiftImportTemplate(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Gift cards');
  sheet.addRow([...GIFT_CARD_IMPORT_HEADERS]);
  sheet.addRow(['money', 40_000, '', '', 1, '', '', '']);
  sheet.addRow(['class', '', 'Reformer Group', 4, 1, '', '', '']);
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  return workbookToBuffer(workbook);
}

export async function buildIssuedCardsWorkbook(
  rows: readonly IssuedGiftExportRow[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Gift cards');
  sheet.addRow([...ISSUED_HEADERS]);
  for (const row of rows) {
    sheet.addRow([
      row.code,
      row.status,
      row.balanceAmd,
      row.balanceClasses,
      row.recipientEmail ?? '',
      row.redeemedAt?.toISOString() ?? '',
      row.expiresAt?.toISOString() ?? '',
    ]);
  }
  sheet.getRow(1).font = { bold: true };
  return workbookToBuffer(workbook);
}

function sheetToMatrix(sheet: ExcelJS.Worksheet): GiftImportCell[][] {
  const width = Math.max(sheet.columnCount, GIFT_CARD_IMPORT_HEADERS.length);
  const matrix: GiftImportCell[][] = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const cells: GiftImportCell[] = [];
    for (let column = 1; column <= width; column += 1) {
      cells.push(normalizeExcelCell(row.getCell(column).value));
    }
    matrix[row.number - 1] = cells;
  });
  for (let index = 0; index < matrix.length; index += 1) {
    if (matrix[index] === undefined) {
      matrix[index] = [];
    }
  }
  return matrix;
}

function normalizeExcelCell(value: ExcelJS.CellValue): GiftImportCell {
  if (value === null || value === undefined) {
    return null;
  }
  if (value instanceof Date || typeof value === 'number' || typeof value === 'string') {
    return value;
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'object' && 'richText' in value) {
    return value.richText.map((part) => part.text).join('');
  }
  if (typeof value === 'object' && 'text' in value && typeof value.text === 'string') {
    return value.text;
  }
  if (typeof value === 'object' && 'result' in value) {
    return normalizeExcelCell(value.result ?? null);
  }
  return null;
}

function toExcelBuffer(value: Buffer): ArrayBuffer {
  const copy = new ArrayBuffer(value.byteLength);
  new Uint8Array(copy).set(value);
  return copy;
}

async function workbookToBuffer(workbook: ExcelJS.Workbook): Promise<Buffer> {
  const bytes = await workbook.xlsx.writeBuffer();
  return Buffer.from(bytes);
}
