import {
  GIFT_CARD_IMPORT_MAX_ROWS,
  GIFT_IMPORT_MESSAGE_MAX_LENGTH,
  type GiftImportCell,
  type GiftImportColumnKey,
  type GiftImportIssue,
  type GiftImportKind,
  type GiftImportParseResult,
  type GiftImportRow,
} from './gift-card-excel';

const EMAIL_MAX_LENGTH = 320;
const MS_PER_MINUTE = 60_000;

const HEADER_KEYS: Record<string, GiftImportColumnKey> = {
  kind: 'kind',
  type: 'kind',
  amountamd: 'amountAmd',
  amount: 'amountAmd',
  classname: 'className',
  class: 'className',
  sessions: 'sessions',
  classquantity: 'sessions',
  quantity: 'quantity',
  qty: 'quantity',
  recipientemail: 'recipientEmail',
  email: 'recipientEmail',
  message: 'message',
  expiresat: 'expiresAt',
  expiration: 'expiresAt',
  expiry: 'expiresAt',
};

const MONEY_KINDS = new Set([
  'money',
  'amd',
  'dram',
  'fixedvalue',
  'value',
  'դրամ',
  'գումար',
  'деньги',
]);

const CLASS_KINDS = new Set([
  'class',
  'classes',
  'session',
  'sessions',
  'fixedclass',
  'դաս',
  'դասեր',
  'занятие',
  'занятия',
]);

type ColumnMap = Partial<Record<GiftImportColumnKey, number>>;

type SharedFields = {
  recipientEmail: string | null;
  message: string | null;
  expiresAt: string | null;
};

export function parseGiftImportMatrix(
  matrix: readonly (readonly GiftImportCell[])[],
): GiftImportParseResult {
  if (matrix.length === 0 || isBlankRow(matrix[0] ?? [])) {
    return { rows: [], issues: [{ rowNumber: 1, code: 'empty_sheet' }] };
  }
  const columns = headerIndex(matrix[0] ?? []);
  if (columns === null) {
    return { rows: [], issues: [{ rowNumber: 1, code: 'missing_columns' }] };
  }
  return collectRows(matrix, columns);
}

function headerIndex(header: readonly GiftImportCell[]): ColumnMap | null {
  const map: ColumnMap = {};
  header.forEach((cell, index) => {
    const key = HEADER_KEYS[normalizeToken(cellText(cell))];
    if (key !== undefined) {
      map[key] = index;
    }
  });
  return map.kind === undefined ? null : map;
}

function collectRows(
  matrix: readonly (readonly GiftImportCell[])[],
  columns: ColumnMap,
): GiftImportParseResult {
  const rows: GiftImportRow[] = [];
  const issues: GiftImportIssue[] = [];
  let dataCount = 0;
  for (let index = 1; index < matrix.length; index += 1) {
    const line = matrix[index] ?? [];
    if (isBlankRow(line)) {
      continue;
    }
    dataCount += 1;
    appendParsedRow(rows, issues, index + 1, line, columns, dataCount);
  }
  if (dataCount === 0) {
    issues.push({ rowNumber: 2, code: 'no_rows' });
  }
  if (dataCount > GIFT_CARD_IMPORT_MAX_ROWS) {
    return { rows: [], issues: [{ rowNumber: 1, code: 'too_many_rows' }] };
  }
  return { rows, issues };
}

function appendParsedRow(
  rows: GiftImportRow[],
  issues: GiftImportIssue[],
  rowNumber: number,
  line: readonly GiftImportCell[],
  columns: ColumnMap,
  dataCount: number,
): void {
  if (dataCount > GIFT_CARD_IMPORT_MAX_ROWS) {
    issues.push({ rowNumber, code: 'too_many_rows' });
    return;
  }
  const parsed = parseDataRow(rowNumber, line, columns);
  if ('code' in parsed) {
    issues.push(parsed);
    return;
  }
  rows.push(parsed);
}

function parseDataRow(
  rowNumber: number,
  line: readonly GiftImportCell[],
  columns: ColumnMap,
): GiftImportRow | GiftImportIssue {
  const kind = readKind(cellAt(line, columns.kind));
  if (kind === null) {
    return { rowNumber, code: 'invalid_kind' };
  }
  const quantityIssue = readQuantity(rowNumber, cellAt(line, columns.quantity));
  if (typeof quantityIssue !== 'number') {
    return quantityIssue;
  }
  const shared = readSharedFields(rowNumber, line, columns);
  if ('code' in shared) {
    return shared;
  }
  return kind === 'money'
    ? readMoneyRow(rowNumber, line, columns, quantityIssue, shared)
    : readClassRow(rowNumber, line, columns, quantityIssue, shared);
}

function readQuantity(rowNumber: number, value: GiftImportCell): number | GiftImportIssue {
  if (cellText(value).length === 0) {
    return 1;
  }
  const quantity = parsePositiveInt(value);
  return quantity === null ? { rowNumber, code: 'invalid_quantity' } : quantity;
}

function readMoneyRow(
  rowNumber: number,
  line: readonly GiftImportCell[],
  columns: ColumnMap,
  quantity: number,
  shared: SharedFields,
): GiftImportRow | GiftImportIssue {
  const amountAmd = parsePositiveInt(cellAt(line, columns.amountAmd));
  if (amountAmd === null) {
    return { rowNumber, code: 'invalid_amount' };
  }
  return { rowNumber, kind: 'money', amountAmd, className: null, sessions: null, quantity, ...shared };
}

function readClassRow(
  rowNumber: number,
  line: readonly GiftImportCell[],
  columns: ColumnMap,
  quantity: number,
  shared: SharedFields,
): GiftImportRow | GiftImportIssue {
  const className = cellText(cellAt(line, columns.className));
  if (className.length === 0) {
    return { rowNumber, code: 'missing_class' };
  }
  const sessions = parsePositiveInt(cellAt(line, columns.sessions));
  if (sessions === null) {
    return { rowNumber, code: 'invalid_sessions' };
  }
  return { rowNumber, kind: 'class', amountAmd: null, className, sessions, quantity, ...shared };
}

function readSharedFields(
  rowNumber: number,
  line: readonly GiftImportCell[],
  columns: ColumnMap,
): SharedFields | GiftImportIssue {
  const recipientEmail = cellText(cellAt(line, columns.recipientEmail));
  if (recipientEmail.length > 0 && !isEmail(recipientEmail)) {
    return { rowNumber, code: 'invalid_email' };
  }
  const message = cellText(cellAt(line, columns.message));
  if (message.length > GIFT_IMPORT_MESSAGE_MAX_LENGTH) {
    return { rowNumber, code: 'invalid_message' };
  }
  const expiresAt = readExpiresAt(cellAt(line, columns.expiresAt));
  if (expiresAt === 'invalid') {
    return { rowNumber, code: 'invalid_expires' };
  }
  return {
    recipientEmail: emptyToNull(recipientEmail),
    message: emptyToNull(message),
    expiresAt,
  };
}

function readKind(value: GiftImportCell): GiftImportKind | null {
  const token = normalizeToken(cellText(value));
  if (MONEY_KINDS.has(token)) {
    return 'money';
  }
  return CLASS_KINDS.has(token) ? 'class' : null;
}

function readExpiresAt(value: GiftImportCell): string | null | 'invalid' {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? 'invalid' : formatCalendarDate(value);
  }
  const text = cellText(value);
  if (text.length === 0) {
    return null;
  }
  const iso = text.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso) || Number.isNaN(new Date(`${iso}T12:00:00.000Z`).getTime())) {
    return 'invalid';
  }
  return iso;
}

function parsePositiveInt(value: GiftImportCell): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 1) {
    return value;
  }
  const text = cellText(value).replace(/[\s,]/g, '');
  if (!/^\d+$/.test(text)) {
    return null;
  }
  const parsed = Number.parseInt(text, 10);
  return parsed >= 1 ? parsed : null;
}

function cellAt(line: readonly GiftImportCell[], index: number | undefined): GiftImportCell {
  return index === undefined ? null : (line[index] ?? null);
}

function isBlankRow(line: readonly GiftImportCell[]): boolean {
  return line.every((cell) => cellText(cell).length === 0);
}

function cellText(value: GiftImportCell): string {
  if (value === null || value instanceof Date) {
    return value instanceof Date ? value.toISOString() : '';
  }
  return String(value).trim();
}

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[\s_-]/g, '');
}

function formatCalendarDate(value: Date): string {
  const shifted = new Date(value.getTime() - value.getTimezoneOffset() * MS_PER_MINUTE);
  return shifted.toISOString().slice(0, 10);
}

function emptyToNull(value: string): string | null {
  return value.length > 0 ? value : null;
}

function isEmail(value: string): boolean {
  return value.length <= EMAIL_MAX_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
