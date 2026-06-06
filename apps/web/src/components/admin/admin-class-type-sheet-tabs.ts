export const CLASS_TYPE_SHEET_TAB_DETAILS = "details";
export const CLASS_TYPE_SHEET_TAB_USAGE = "usage";

export type ClassTypeSheetTabId =
  | typeof CLASS_TYPE_SHEET_TAB_DETAILS
  | typeof CLASS_TYPE_SHEET_TAB_USAGE;

export const CLASS_TYPE_SHEET_TAB_ORDER: readonly ClassTypeSheetTabId[] = [
  CLASS_TYPE_SHEET_TAB_DETAILS,
  CLASS_TYPE_SHEET_TAB_USAGE,
];
