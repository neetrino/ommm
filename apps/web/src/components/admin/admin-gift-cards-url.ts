import type {
  GiftCardExpirationFilter,
  GiftCardFilterValues,
  GiftCardQuickFilter,
  GiftCardSortOrder,
  GiftCardStatus,
} from "@/components/admin/admin-gift-cards-types";
import { GIFT_CARD_STATUSES } from "@/components/admin/admin-gift-cards-types";
import { parseFilterMultiValue } from "@/lib/filter-multi-value";

export const GIFT_CARD_FILTER_QUERY_KEYS = [
  "search",
  "status",
  "expiration",
  "amountMin",
  "amountMax",
  "order",
  "quick",
] as const;

export const GIFT_CARD_MODAL_QUERY_KEY = "modal";
export const GIFT_CARD_CREATE_MODAL_VALUE = "create-gift-card";
export const GIFT_CARD_EDIT_MODAL_VALUE = "edit-gift-card";
export const GIFT_CARD_BATCH_ID_QUERY_KEY = "batchId";

/** Preserves filter/view params while opening the edit gift-card center modal. */
export function buildGiftCardEditModalSearch(currentSearch: string, batchId: string): string {
  const params = new URLSearchParams(currentSearch);
  params.set(GIFT_CARD_MODAL_QUERY_KEY, GIFT_CARD_EDIT_MODAL_VALUE);
  params.set(GIFT_CARD_BATCH_ID_QUERY_KEY, batchId);
  return params.toString();
}

const SORT_ORDERS: readonly GiftCardSortOrder[] = [
  "newest",
  "oldest",
  "amountHigh",
  "amountLow",
  "expirationSoon",
];

const EXPIRATION_VALUES = new Set<GiftCardExpirationFilter>(["valid", "expired"]);
const QUICK_VALUES = new Set<Exclude<GiftCardQuickFilter, "">>([
  "active",
  "expired",
  "unredeemed",
]);
const STATUS_VALUES = new Set<string>(GIFT_CARD_STATUSES);

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

/** Accepts single or comma-separated status values from the URL. */
export function parseGiftCardStatusFilter(
  value: string | string[] | undefined,
): string {
  const raw = firstParam(value)?.trim() ?? "";
  if (raw === "" || raw === "all") {
    return "all";
  }
  const selected = parseFilterMultiValue(raw).filter((part) =>
    STATUS_VALUES.has(part as GiftCardStatus),
  );
  return selected.length === 0 ? "all" : selected.join(",");
}

export function parseGiftCardExpirationFilter(
  value: string | string[] | undefined,
): string {
  const raw = firstParam(value)?.trim() ?? "";
  if (raw === "" || raw === "all") {
    return "all";
  }
  const selected = parseFilterMultiValue(raw).filter((part) =>
    EXPIRATION_VALUES.has(part as GiftCardExpirationFilter),
  );
  return selected.length === 0 ? "all" : selected.join(",");
}

export function parseGiftCardQuickFilter(
  value: string | string[] | undefined,
): string {
  const raw = firstParam(value)?.trim() ?? "";
  if (raw === "") {
    return "";
  }
  const selected = parseFilterMultiValue(raw).filter((part) =>
    QUICK_VALUES.has(part as Exclude<GiftCardQuickFilter, "">),
  );
  return selected.join(",");
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
  const statusParts = parseFilterMultiValue(values.status);
  if (statusParts.length > 0) {
    params.set("status", statusParts.join(","));
  }
  const expirationParts = parseFilterMultiValue(values.expiration);
  if (expirationParts.length > 0) {
    params.set("expiration", expirationParts.join(","));
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
  const quickParts = parseFilterMultiValue(values.quick);
  if (quickParts.length > 0) {
    params.set("quick", quickParts.join(","));
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
