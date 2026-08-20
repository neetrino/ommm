export const USER_GIFT_CARDS_TAB_PARAM = "tab";

export type UserGiftCardsTab = "my" | "shop";

export const DEFAULT_USER_GIFT_CARDS_TAB: UserGiftCardsTab = "my";

export const USER_GIFT_CARDS_TABS: readonly UserGiftCardsTab[] = ["my", "shop"];

export const USER_GIFT_CARDS_PATH = "/user/gift-cards";

/** Gift cards list opened on the Buy (shop) tab. */
export const USER_GIFT_CARDS_SHOP_PATH = `${USER_GIFT_CARDS_PATH}?${USER_GIFT_CARDS_TAB_PARAM}=shop`;

/** Resolves the active gift cards page tab from URL search params. */
export function parseUserGiftCardsTab(
  search: Record<string, string | undefined>,
): UserGiftCardsTab {
  return search[USER_GIFT_CARDS_TAB_PARAM] === "shop" ? "shop" : "my";
}
