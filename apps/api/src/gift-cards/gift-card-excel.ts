/** Rows accepted in one admin Excel import. */
export const GIFT_CARD_IMPORT_MAX_ROWS = 200;

export const GIFT_CARD_IMPORT_MAX_BYTES = 2 * 1024 * 1024;

export const GIFT_CARD_IMPORT_HEADERS = [
  'kind',
  'amountAmd',
  'className',
  'sessions',
  'quantity',
  'recipientEmail',
  'message',
  'expiresAt',
] as const;

export const GIFT_IMPORT_MESSAGE_MAX_LENGTH = 4000;

export type GiftImportCell = string | number | Date | boolean | null;

export type GiftImportIssueCode =
  | 'empty_sheet'
  | 'missing_columns'
  | 'no_rows'
  | 'too_many_rows'
  | 'invalid_kind'
  | 'invalid_amount'
  | 'missing_class'
  | 'invalid_sessions'
  | 'invalid_quantity'
  | 'invalid_email'
  | 'invalid_expires'
  | 'invalid_message'
  | 'class_not_found'
  | 'ambiguous_class'
  | 'recipient_not_found'
  | 'create_failed';

export type GiftImportIssue = {
  rowNumber: number;
  code: GiftImportIssueCode;
};

export type GiftImportKind = 'money' | 'class';

export type GiftImportRow = {
  rowNumber: number;
  kind: GiftImportKind;
  amountAmd: number | null;
  className: string | null;
  sessions: number | null;
  quantity: number;
  recipientEmail: string | null;
  message: string | null;
  expiresAt: string | null;
};

export type GiftImportParseResult = {
  rows: GiftImportRow[];
  issues: GiftImportIssue[];
};

export type GiftImportColumnKey =
  | 'kind'
  | 'amountAmd'
  | 'className'
  | 'sessions'
  | 'quantity'
  | 'recipientEmail'
  | 'message'
  | 'expiresAt';
