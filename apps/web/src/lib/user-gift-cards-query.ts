import { parseListPageParams } from "@/lib/list-pagination";

export const USER_GIFT_CARDS_MY_PAGE_KEYS = {
  pageKey: "myPage",
  pageSizeKey: "myPageSize",
} as const;

export function parseUserGiftCardsMyPageParams(
  search: Record<string, string | undefined>,
) {
  return parseListPageParams(search, USER_GIFT_CARDS_MY_PAGE_KEYS);
}
