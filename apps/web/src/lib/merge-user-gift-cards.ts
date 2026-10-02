import type {
  UserGiftCardRow,
  UserGiftCardSource,
} from "@/components/account/user-gift-cards-types";

export type UserGiftCardWithSource = UserGiftCardRow & {
  source: UserGiftCardSource;
  /** True when this account is the recipient and can spend the balance. */
  spendable: boolean;
};

/** Merges purchased and received cards into one list, deduped by id, newest first. */
export function mergeUserGiftCards(
  purchased: readonly UserGiftCardRow[],
  received: readonly UserGiftCardRow[],
): UserGiftCardWithSource[] {
  const purchasedIds = new Set(purchased.map((card) => card.id));
  const receivedIds = new Set(received.map((card) => card.id));
  const merged: UserGiftCardWithSource[] = [
    ...purchased.map((card) => ({
      ...card,
      source: "purchased" as const,
      spendable: receivedIds.has(card.id),
    })),
    ...received
      .filter((card) => !purchasedIds.has(card.id))
      .map((card) => ({ ...card, source: "received" as const, spendable: true })),
  ];

  return merged.sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}
