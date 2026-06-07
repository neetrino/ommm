import {
  parseDateSortOrder,
  parseSessionSortOrder,
  parseUserGiftCardSortOrder,
  parseUserPackageSortOrder,
  type DateSortOrder,
  type SessionSortOrder,
  type UserGiftCardSortOrder,
  type UserPackageSortOrder,
} from "@/lib/list-sort";

export const USER_LIST_ORDER_QUERY_KEY = "order";

export function readUserListOrderFromSearch(
  search: URLSearchParams | Record<string, string | undefined>,
  kind: "session",
  fallback?: SessionSortOrder,
): SessionSortOrder;
export function readUserListOrderFromSearch(
  search: URLSearchParams | Record<string, string | undefined>,
  kind: "date",
  fallback?: DateSortOrder,
): DateSortOrder;
export function readUserListOrderFromSearch(
  search: URLSearchParams | Record<string, string | undefined>,
  kind: "giftCard",
  fallback?: UserGiftCardSortOrder,
): UserGiftCardSortOrder;
export function readUserListOrderFromSearch(
  search: URLSearchParams | Record<string, string | undefined>,
  kind: "package",
  fallback?: UserPackageSortOrder,
): UserPackageSortOrder;
export function readUserListOrderFromSearch(
  search: URLSearchParams | Record<string, string | undefined>,
  kind: "session" | "date" | "giftCard" | "package",
  fallback?: SessionSortOrder | DateSortOrder | UserGiftCardSortOrder | UserPackageSortOrder,
): SessionSortOrder | DateSortOrder | UserGiftCardSortOrder | UserPackageSortOrder {
  const raw =
    search instanceof URLSearchParams
      ? search.get(USER_LIST_ORDER_QUERY_KEY) ?? undefined
      : search[USER_LIST_ORDER_QUERY_KEY];

  switch (kind) {
    case "session":
      return parseSessionSortOrder(raw, (fallback as SessionSortOrder | undefined) ?? "upcoming");
    case "date":
      return parseDateSortOrder(raw, (fallback as DateSortOrder | undefined) ?? "newest");
    case "giftCard":
      return parseUserGiftCardSortOrder(
        raw,
        (fallback as UserGiftCardSortOrder | undefined) ?? "newest",
      );
    case "package":
      return parseUserPackageSortOrder(
        raw,
        (fallback as UserPackageSortOrder | undefined) ?? "upcoming",
      );
    default:
      return parseDateSortOrder(raw, "newest");
  }
}

export function syncUserListOrderQuery(
  params: URLSearchParams,
  order: string,
  defaultOrder: string,
): void {
  if (order === defaultOrder) {
    params.delete(USER_LIST_ORDER_QUERY_KEY);
    return;
  }
  params.set(USER_LIST_ORDER_QUERY_KEY, order);
}
