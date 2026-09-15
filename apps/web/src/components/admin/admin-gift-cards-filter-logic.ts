import type {
  AdminGiftCardBatchRow,
  GiftCardFilterValues,
  GiftCardSortOrder,
} from "@/components/admin/admin-gift-cards-types";
import { parseAmdMoneyInput } from "@/lib/price-amd";
import { matchesFilterMultiValue, parseFilterMultiValue } from "@/lib/filter-multi-value";

export function isGiftCardExpired(card: AdminGiftCardBatchRow, now = Date.now()): boolean {
  if (card.status === "EXPIRED") {
    return true;
  }
  if (card.expiresAt === null) {
    return false;
  }
  const expiresAt = new Date(card.expiresAt).getTime();
  return !Number.isNaN(expiresAt) && expiresAt < now;
}

export function purchaserLabel(card: AdminGiftCardBatchRow): string {
  const name = card.purchaser?.name?.trim();
  if (name) {
    return name;
  }
  const email = card.purchaser?.email?.trim();
  return email && email.length > 0 ? email : "—";
}

export function recipientLabel(card: AdminGiftCardBatchRow): string {
  return (
    card.recipientName?.trim() ||
    card.recipient?.name?.trim() ||
    card.recipient?.email?.trim() ||
    card.recipientEmail?.trim() ||
    ""
  );
}

function parseAmountFilter(value: string): number | null {
  return parseAmdMoneyInput(value);
}

function matchesSearch(card: AdminGiftCardBatchRow, search: string): boolean {
  if (search.length === 0) {
    return true;
  }
  const haystack = [
    purchaserLabel(card),
    card.purchaser?.email ?? "",
    recipientLabel(card),
    card.recipientEmail ?? "",
    card.status,
    String(card.amountAmd),
    String(card.availableQuantity),
    String(card.totalQuantity),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(search);
}

function matchesQuickFilter(card: AdminGiftCardBatchRow, quickCsv: string): boolean {
  const quickValues = parseFilterMultiValue(quickCsv);
  if (quickValues.length === 0) {
    return true;
  }
  return quickValues.some((quick) => {
    switch (quick) {
      case "active":
        return card.status === "ACTIVE";
      case "expired":
        return isGiftCardExpired(card);
      case "unredeemed":
        return card.status === "ACTIVE" && card.availableQuantity > 0;
      default:
        return false;
    }
  });
}

export function countActiveGiftCardFilters(values: GiftCardFilterValues): number {
  return [
    values.search.trim(),
    parseFilterMultiValue(values.status).length > 0 ? values.status : "",
    parseFilterMultiValue(values.expiration).length > 0 ? values.expiration : "",
    values.amountMin.trim(),
    values.amountMax.trim(),
    values.order === "newest" ? "" : values.order,
    parseFilterMultiValue(values.quick).length > 0 ? values.quick : "",
  ].filter(Boolean).length;
}

export function filterGiftCards(
  cards: readonly AdminGiftCardBatchRow[],
  values: GiftCardFilterValues,
): AdminGiftCardBatchRow[] {
  const search = values.search.trim().toLowerCase();
  const minAmount = parseAmountFilter(values.amountMin);
  const maxAmount = parseAmountFilter(values.amountMax);
  const expiration = parseFilterMultiValue(values.expiration);

  return cards.filter((card) => {
    if (!matchesFilterMultiValue(values.status, card.status)) {
      return false;
    }
    if (expiration.length > 0) {
      const expired = isGiftCardExpired(card);
      const ok =
        (expiration.includes("valid") && !expired) ||
        (expiration.includes("expired") && expired);
      if (!ok) {
        return false;
      }
    }
    if (minAmount !== null && card.amountAmd < minAmount) {
      return false;
    }
    if (maxAmount !== null && card.amountAmd > maxAmount) {
      return false;
    }
    if (!matchesQuickFilter(card, values.quick)) {
      return false;
    }
    if (!matchesSearch(card, search)) {
      return false;
    }
    return true;
  });
}

export function sortGiftCards(
  cards: readonly AdminGiftCardBatchRow[],
  order: GiftCardSortOrder,
): AdminGiftCardBatchRow[] {
  const rows = [...cards];
  rows.sort((a, b) => {
    switch (order) {
      case "oldest":
        return a.createdAt.localeCompare(b.createdAt);
      case "amountHigh":
        return b.amountAmd - a.amountAmd || b.createdAt.localeCompare(a.createdAt);
      case "amountLow":
        return a.amountAmd - b.amountAmd || b.createdAt.localeCompare(a.createdAt);
      case "expirationSoon": {
        const aTime = a.expiresAt ? new Date(a.expiresAt).getTime() : Number.POSITIVE_INFINITY;
        const bTime = b.expiresAt ? new Date(b.expiresAt).getTime() : Number.POSITIVE_INFINITY;
        return aTime - bTime || b.createdAt.localeCompare(a.createdAt);
      }
      case "newest":
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });
  return rows;
}
