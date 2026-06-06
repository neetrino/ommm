export const USER_GIFT_CARD_SHEET_TAB_OVERVIEW = "overview";
export const USER_GIFT_CARD_SHEET_TAB_ACTIONS = "actions";

export type UserGiftCardSheetTabId =
  | typeof USER_GIFT_CARD_SHEET_TAB_OVERVIEW
  | typeof USER_GIFT_CARD_SHEET_TAB_ACTIONS;

export const USER_GIFT_CARD_SHEET_TAB_ORDER: readonly UserGiftCardSheetTabId[] = [
  USER_GIFT_CARD_SHEET_TAB_OVERVIEW,
  USER_GIFT_CARD_SHEET_TAB_ACTIONS,
];
