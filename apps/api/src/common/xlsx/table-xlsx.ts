import ExcelJS from 'exceljs';

export type TableXlsxCell = string | number | null;

export type TableXlsxColumn = {
  header: string;
  width: number;
  /** Right-aligned, thousands-separated whole numbers (e.g. AMD). */
  numeric?: boolean;
};

export type TableXlsxInput = {
  sheetName: string;
  title: string;
  subtitle: string;
  columns: readonly TableXlsxColumn[];
  rows: readonly (readonly TableXlsxCell[])[];
};

/** Title, subtitle, spacer, then the column header. */
const HEADER_ROW = 4;
const TITLE_ROW_HEIGHT = 34;
const SUBTITLE_ROW_HEIGHT = 22;
const SPACER_ROW_HEIGHT = 10;
const HEADER_ROW_HEIGHT = 26;
const DATA_ROW_HEIGHT = 20;
const A4_PAPER_SIZE = 9;

const FONT_NAME = 'Calibri';
const INK = 'FF3D4A38';
const MUTED = 'FF6B6458';
const WHITE = 'FFFFFFFF';
const HEADER_FILL = 'FF5C6B57';
const ZEBRA_FILL = 'FFFBF8F3';
const LINE = 'FFE4DDD2';
const AMOUNT_FORMAT = '#,##0';

const THIN_EDGE = { style: 'thin' as const, color: { argb: LINE } };
const TABLE_BORDER = {
  top: THIN_EDGE,
  left: THIN_EDGE,
  bottom: THIN_EDGE,
  right: THIN_EDGE,
};

/** Styled single-sheet table workbook shared by back-office exports. */
export async function buildTableXlsx(input: TableXlsxInput): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Ommm';
  workbook.created = new Date();
  const sheet = workbook.addWorksheet(input.sheetName, {
    properties: { tabColor: { argb: HEADER_FILL } },
    views: [{ showGridLines: false }],
  });
  const columnCount = input.columns.length;

  writeBandRow(sheet, input.title, columnCount, TITLE_ROW_HEIGHT, {
    size: 18,
    bold: true,
    color: { argb: INK },
  });
  writeBandRow(sheet, input.subtitle, columnCount, SUBTITLE_ROW_HEIGHT, {
    size: 12,
    color: { argb: MUTED },
  });
  sheet.addRow([]).height = SPACER_ROW_HEIGHT;
  writeHeaderRow(sheet, input.columns);
  input.rows.forEach((cells, index) => {
    writeDataRow(sheet, input.columns, cells, index % 2 === 1);
  });
  applySheetLayout(sheet, input.columns, input.rows.length);

  const raw = await workbook.xlsx.writeBuffer();
  return Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
}

function writeBandRow(
  sheet: ExcelJS.Worksheet,
  text: string,
  columnCount: number,
  height: number,
  font: Partial<ExcelJS.Font>,
): void {
  const row = sheet.addRow([text]);
  sheet.mergeCells(row.number, 1, row.number, columnCount);
  row.height = height;
  const cell = row.getCell(1);
  cell.font = { name: FONT_NAME, ...font };
  cell.alignment = { vertical: 'middle', horizontal: 'left' };
}

function writeHeaderRow(
  sheet: ExcelJS.Worksheet,
  columns: readonly TableXlsxColumn[],
): void {
  const row = sheet.addRow(columns.map((column) => column.header));
  row.height = HEADER_ROW_HEIGHT;
  columns.forEach((column, index) => {
    const cell = row.getCell(index + 1);
    cell.font = {
      name: FONT_NAME,
      size: 11,
      bold: true,
      color: { argb: WHITE },
    };
    cell.fill = solidFill(HEADER_FILL);
    cell.alignment = {
      vertical: 'middle',
      horizontal: column.numeric ? 'right' : 'left',
      wrapText: true,
    };
    cell.border = TABLE_BORDER;
  });
}

function writeDataRow(
  sheet: ExcelJS.Worksheet,
  columns: readonly TableXlsxColumn[],
  cells: readonly TableXlsxCell[],
  stripe: boolean,
): void {
  const row = sheet.addRow([...cells]);
  row.height = DATA_ROW_HEIGHT;
  columns.forEach((column, index) => {
    const cell = row.getCell(index + 1);
    cell.font = { name: FONT_NAME, size: 11, color: { argb: INK } };
    cell.alignment = {
      vertical: 'middle',
      horizontal: column.numeric ? 'right' : 'left',
    };
    cell.border = TABLE_BORDER;
    if (stripe) {
      cell.fill = solidFill(ZEBRA_FILL);
    }
    if (column.numeric) {
      cell.numFmt = AMOUNT_FORMAT;
    }
  });
}

function applySheetLayout(
  sheet: ExcelJS.Worksheet,
  columns: readonly TableXlsxColumn[],
  rowCount: number,
): void {
  columns.forEach((column, index) => {
    sheet.getColumn(index + 1).width = column.width;
  });
  sheet.autoFilter = {
    from: { row: HEADER_ROW, column: 1 },
    to: { row: HEADER_ROW + rowCount, column: columns.length },
  };
  sheet.views = [{ state: 'frozen', ySplit: HEADER_ROW, showGridLines: false }];
  sheet.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: A4_PAPER_SIZE,
    printTitlesRow: `1:${HEADER_ROW}`,
  };
}

function solidFill(argb: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } };
}
