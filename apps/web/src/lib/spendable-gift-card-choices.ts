import { isGiftCardDateExpired } from "@/components/gift-cards/gift-card-display-helpers";
import type { UserGiftCardRow } from "@/components/account/user-gift-cards-types";

export type SpendableGiftCardChoice = {
  id: string;
  code: string;
  balanceCents: number;
};

/** Active money cards this member can spend on a package. */
export function spendableGiftCardChoices(
  cards: readonly UserGiftCardRow[],
  now = Date.now(),
): SpendableGiftCardChoice[] {
  return cards.flatMap((card) => {
    if (card.status !== "ACTIVE" || card.balanceCents <= 0) {
      return [];
    }
    if (isGiftCardDateExpired(card.status, card.expiresAt, now)) {
      return [];
    }
    return [{ id: card.id, code: card.code, balanceCents: card.balanceCents }];
  });
}

export function appliedPackageGiftCents(input: {
  choosingCards: boolean;
  selectedCardCents: number;
  useGiftCredits: boolean;
  spendableGiftCents: number;
  priceCents: number;
}): number {
  if (input.priceCents <= 0) {
    return 0;
  }
  if (input.choosingCards) {
    return Math.min(input.selectedCardCents, input.priceCents);
  }
  if (!input.useGiftCredits) {
    return 0;
  }
  return Math.min(input.spendableGiftCents, input.priceCents);
}

/** What stays on the selected cards after this purchase. */
export function remainingGiftCents(selectedCents: number, appliedCents: number): number {
  return Math.max(0, selectedCents - appliedCents);
}

export function selectedGiftBalanceCents(
  cards: readonly SpendableGiftCardChoice[],
  selectedIds: readonly string[],
): number {
  const selected = new Set(selectedIds);
  return cards.reduce((sum, card) => {
    return selected.has(card.id) ? sum + card.balanceCents : sum;
  }, 0);
}
