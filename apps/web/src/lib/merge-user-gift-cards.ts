import type {
  UserGiftCardRow,
  UserGiftCardSource,
} from "@/components/account/user-gift-cards-types";

export type UserGiftCardWithSource = UserGiftCardRow & {
  source: UserGiftCardSource;
};

/** Merges purchased and received cards into one list, deduped by id, newest first. */
export function mergeUserGiftCards(
  purchased: readonly UserGiftCardRow[],
  received: readonly UserGiftCardRow[],
): UserGiftCardWithSource[] {
  const purchasedIds = new Set(purchased.map((card) => card.id));
  const merged: UserGiftCardWithSource[] = [
    ...purchased.map((card) => ({ ...card, source: "purchased" as const })),
    ...received
      .filter((card) => !purchasedIds.has(card.id))
      .map((card) => ({ ...card, source: "received" as const })),
  ];

  return merged.sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}
