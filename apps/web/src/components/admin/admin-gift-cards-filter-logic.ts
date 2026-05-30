import type {
  AdminGiftCardRow,
  GiftCardFilterValues,
  GiftCardSortOrder,
} from "@/components/admin/admin-gift-cards-types";

export function isGiftCardExpired(card: AdminGiftCardRow, now = Date.now()): boolean {
  if (card.status === "EXPIRED") {
    return true;
  }
  if (card.expiresAt === null) {
    return false;
  }
  const expiresAt = new Date(card.expiresAt).getTime();
  return !Number.isNaN(expiresAt) && expiresAt < now;
}

export function purchaserLabel(card: AdminGiftCardRow): string {
  return card.purchaser.name?.trim() || card.purchaser.email;
}

export function recipientLabel(card: AdminGiftCardRow): string {
  return (
    card.recipientName?.trim() ||
    card.recipient?.name?.trim() ||
    card.recipient?.email?.trim() ||
    card.recipientEmail?.trim() ||
    ""
  );
}

function parseAmountFilter(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function matchesSearch(card: AdminGiftCardRow, search: string): boolean {
  if (search.length === 0) {
    return true;
  }
  const haystack = [
    purchaserLabel(card),
    card.purchaser.email,
    recipientLabel(card),
    card.recipientEmail ?? "",
    card.status,
    String(card.amountCents),
    String(card.balanceCents),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(search);
}

function matchesQuickFilter(card: AdminGiftCardRow, quick: GiftCardFilterValues["quick"]): boolean {
  switch (quick) {
    case "active":
      return card.status === "ACTIVE";
    case "expired":
      return isGiftCardExpired(card);
    case "unredeemed":
      return card.status === "ACTIVE" && card.balanceCents > 0;
    default:
      return true;
  }
}

export function countActiveGiftCardFilters(values: GiftCardFilterValues): number {
  return [
    values.search.trim(),
    values.status === "all" ? "" : values.status,
    values.expiration === "all" ? "" : values.expiration,
    values.amountMin.trim(),
    values.amountMax.trim(),
    values.order === "newest" ? "" : values.order,
    values.quick,
  ].filter(Boolean).length;
}

export function filterGiftCards(
  cards: readonly AdminGiftCardRow[],
  values: GiftCardFilterValues,
): AdminGiftCardRow[] {
  const search = values.search.trim().toLowerCase();
  const minAmount = parseAmountFilter(values.amountMin);
  const maxAmount = parseAmountFilter(values.amountMax);

  return cards.filter((card) => {
    if (values.status !== "all" && card.status !== values.status) {
      return false;
    }
    if (values.expiration === "valid" && isGiftCardExpired(card)) {
      return false;
    }
    if (values.expiration === "expired" && !isGiftCardExpired(card)) {
      return false;
    }
    if (minAmount !== null && card.amountCents < minAmount) {
      return false;
    }
    if (maxAmount !== null && card.amountCents > maxAmount) {
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
  cards: readonly AdminGiftCardRow[],
  order: GiftCardSortOrder,
): AdminGiftCardRow[] {
  const rows = [...cards];
  rows.sort((a, b) => {
    switch (order) {
      case "oldest":
        return a.createdAt.localeCompare(b.createdAt);
      case "amountHigh":
        return b.amountCents - a.amountCents || b.createdAt.localeCompare(a.createdAt);
      case "amountLow":
        return a.amountCents - b.amountCents || b.createdAt.localeCompare(a.createdAt);
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
