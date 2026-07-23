import type { AdminGiftCardBatchRow } from "@/components/admin/admin-gift-cards-types";

export {
  displayGiftCardDate,
  giftCardStatusBadgeClass,
  isGiftCardDateExpired,
} from "@/components/gift-cards/gift-card-display-helpers";

export function giftCardQuantityLabel(card: AdminGiftCardBatchRow): string {
  return `${card.availableQuantity} / ${card.totalQuantity}`;
}
