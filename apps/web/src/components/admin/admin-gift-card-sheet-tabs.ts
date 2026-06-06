export const GIFT_CARD_SHEET_TAB_OVERVIEW = "overview";
export const GIFT_CARD_SHEET_TAB_ACTIONS = "actions";
export const GIFT_CARD_SHEET_TAB_HISTORY = "history";

export type GiftCardSheetTabId =
  | typeof GIFT_CARD_SHEET_TAB_OVERVIEW
  | typeof GIFT_CARD_SHEET_TAB_ACTIONS
  | typeof GIFT_CARD_SHEET_TAB_HISTORY;

export const GIFT_CARD_SHEET_TAB_ORDER: readonly GiftCardSheetTabId[] = [
  GIFT_CARD_SHEET_TAB_OVERVIEW,
  GIFT_CARD_SHEET_TAB_ACTIONS,
  GIFT_CARD_SHEET_TAB_HISTORY,
];
