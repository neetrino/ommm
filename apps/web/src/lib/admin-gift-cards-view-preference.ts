export type AdminGiftCardsViewMode = "list" | "board";

export const ADMIN_GIFT_CARDS_VIEW_QUERY_KEY = "view";
export const DEFAULT_ADMIN_GIFT_CARDS_VIEW_MODE: AdminGiftCardsViewMode = "board";

const VALID_MODES: readonly AdminGiftCardsViewMode[] = ["list", "board"];

function isAdminGiftCardsViewMode(value: string | null): value is AdminGiftCardsViewMode {
  return value !== null && (VALID_MODES as readonly string[]).includes(value);
}

export function parseAdminGiftCardsViewMode(
  value: string | string[] | null | undefined,
): AdminGiftCardsViewMode {
  const requestedValue = Array.isArray(value) ? value[0] : value;
  if (requestedValue === undefined || requestedValue === null) {
    return DEFAULT_ADMIN_GIFT_CARDS_VIEW_MODE;
  }
  return isAdminGiftCardsViewMode(requestedValue)
    ? requestedValue
    : DEFAULT_ADMIN_GIFT_CARDS_VIEW_MODE;
}
