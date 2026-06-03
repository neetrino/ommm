import type { AdminGiftCardBatchRow } from "@/components/admin/admin-gift-cards-types";
import { formatDateForUi } from "@/lib/date-display";

export function displayGiftCardDate(value: string | null): string {
  if (value === null) {
    return "—";
  }
  const formatted = formatDateForUi(value);
  return formatted.length > 0 ? formatted : "—";
}

export function giftCardStatusBadgeClass(status: AdminGiftCardBatchRow["status"]): string {
  if (status === "ACTIVE") {
    return "inline-flex rounded-full border border-mint-200 bg-mint-50 px-2 py-0.5 text-xs text-sage-900";
  }
  if (status === "REDEEMED") {
    return "inline-flex rounded-full border border-sand-200 bg-sand-50 px-2 py-0.5 text-xs text-sage-900";
  }
  if (status === "DEACTIVATED") {
    return "inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs text-red-700";
  }
  return "inline-flex rounded-full border border-sage-200 bg-sage-50 px-2 py-0.5 text-xs text-sage-700";
}

export function giftCardQuantityLabel(card: AdminGiftCardBatchRow): string {
  return `${card.availableQuantity} / ${card.totalQuantity}`;
}
