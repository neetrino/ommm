import type { UserGiftCardRow } from "@/components/account/user-gift-cards-types";
import { parseListPageParams } from "@/lib/list-pagination";

export const USER_GIFT_CARDS_PURCHASED_PAGE_KEYS = {
  pageKey: "purchasedPage",
  pageSizeKey: "purchasedPageSize",
} as const;

export const USER_GIFT_CARDS_RECEIVED_PAGE_KEYS = {
  pageKey: "receivedPage",
  pageSizeKey: "receivedPageSize",
} as const;

export type UserGiftCardsSectionPayload = {
  items: UserGiftCardRow[];
  total: number;
  take: number;
  offset: number;
};

export function buildUserGiftCardsPurchasedEndpoint(
  take: number,
  offset: number,
): string {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
  });
  return `/gift-cards/me/purchased?${params.toString()}`;
}

export function buildUserGiftCardsReceivedEndpoint(
  take: number,
  offset: number,
): string {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
  });
  return `/gift-cards/me/received?${params.toString()}`;
}

export function parseUserGiftCardsPurchasedPageParams(
  search: Record<string, string | undefined>,
) {
  return parseListPageParams(search, USER_GIFT_CARDS_PURCHASED_PAGE_KEYS);
}

export function parseUserGiftCardsReceivedPageParams(
  search: Record<string, string | undefined>,
) {
  return parseListPageParams(search, USER_GIFT_CARDS_RECEIVED_PAGE_KEYS);
}
