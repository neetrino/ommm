import type {
  GiftCardExpirationFilter,
  GiftCardFilterValues,
  GiftCardQuickFilter,
  GiftCardSortOrder,
  GiftCardStatus,
  GiftCardStatusFilter,
} from "@/components/admin/admin-gift-cards-types";
import { GIFT_CARD_STATUSES } from "@/components/admin/admin-gift-cards-types";

export const GIFT_CARD_FILTER_QUERY_KEYS = [
  "search",
  "status",
  "expiration",
  "amountMin",
  "amountMax",
  "order",
  "quick",
] as const;

const SORT_ORDERS: readonly GiftCardSortOrder[] = [
  "newest",
  "oldest",
  "amountHigh",
  "amountLow",
  "expirationSoon",
];

const EXPIRATION_FILTERS: readonly GiftCardExpirationFilter[] = ["all", "valid", "expired"];

const QUICK_FILTERS: readonly GiftCardQuickFilter[] = ["", "active", "expired", "unredeemed"];

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function parseGiftCardSortOrder(
  value: string | string[] | undefined,
): GiftCardSortOrder {
  const raw = firstParam(value);
  return SORT_ORDERS.includes(raw as GiftCardSortOrder)
    ? (raw as GiftCardSortOrder)
    : "newest";
}

export function parseGiftCardStatusFilter(
  value: string | string[] | undefined,
): GiftCardStatusFilter {
  const raw = firstParam(value);
  if (raw === "all" || raw === undefined) {
    return "all";
  }
  return GIFT_CARD_STATUSES.includes(raw as GiftCardStatus)
    ? (raw as GiftCardStatus)
    : "all";
}

export function parseGiftCardExpirationFilter(
  value: string | string[] | undefined,
): GiftCardExpirationFilter {
  const raw = firstParam(value);
  return EXPIRATION_FILTERS.includes(raw as GiftCardExpirationFilter)
    ? (raw as GiftCardExpirationFilter)
    : "all";
}

export function parseGiftCardQuickFilter(
  value: string | string[] | undefined,
): GiftCardQuickFilter {
  const raw = firstParam(value);
  return QUICK_FILTERS.includes(raw as GiftCardQuickFilter)
    ? (raw as GiftCardQuickFilter)
    : "";
}

export function parseGiftCardFiltersFromSearch(
  search: Record<string, string | string[] | undefined>,
): GiftCardFilterValues {
  return {
    search: firstParam(search.search)?.trim() ?? "",
    status: parseGiftCardStatusFilter(search.status),
    expiration: parseGiftCardExpirationFilter(search.expiration),
    amountMin: firstParam(search.amountMin)?.trim() ?? "",
    amountMax: firstParam(search.amountMax)?.trim() ?? "",
    order: parseGiftCardSortOrder(search.order),
    quick: parseGiftCardQuickFilter(search.quick),
  };
}

export function buildGiftCardFiltersQuery(values: GiftCardFilterValues): string {
  const params = new URLSearchParams();
  if (values.search.trim().length > 0) {
    params.set("search", values.search.trim());
  }
  if (values.status !== "all") {
    params.set("status", values.status);
  }
  if (values.expiration !== "all") {
    params.set("expiration", values.expiration);
  }
  if (values.amountMin.trim().length > 0) {
    params.set("amountMin", values.amountMin.trim());
  }
  if (values.amountMax.trim().length > 0) {
    params.set("amountMax", values.amountMax.trim());
  }
  if (values.order !== "newest") {
    params.set("order", values.order);
  }
  if (values.quick !== "") {
    params.set("quick", values.quick);
  }
  return params.toString();
}

export function giftCardFiltersQueryKey(values: GiftCardFilterValues): string {
  return [
    values.search,
    values.status,
    values.expiration,
    values.amountMin,
    values.amountMax,
    values.order,
    values.quick,
  ].join("|");
}
