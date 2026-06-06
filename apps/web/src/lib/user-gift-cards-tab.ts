export const USER_GIFT_CARDS_TAB_PARAM = "tab";

export type UserGiftCardsTab = "my" | "shop";

export const DEFAULT_USER_GIFT_CARDS_TAB: UserGiftCardsTab = "my";

export const USER_GIFT_CARDS_TABS: readonly UserGiftCardsTab[] = ["my", "shop"];

/** Resolves the active gift cards page tab from URL search params. */
export function parseUserGiftCardsTab(
  search: Record<string, string | undefined>,
): UserGiftCardsTab {
  return search[USER_GIFT_CARDS_TAB_PARAM] === "shop" ? "shop" : "my";
}
