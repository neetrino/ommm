import type { ReactNode } from "react";

export { GIFT_CARD_BOARD_GRID_CLASS } from "@/components/gift-cards/gift-card-board-tile";

export const USER_GIFT_CARDS_SECTION_CLASS = "mt-10 first:mt-0";

export const USER_GIFT_CARDS_SECTION_TITLE_CLASS = "ommm-h3 text-sage-800";

type UserGiftCardsSectionProps = {
  title: string;
  children: ReactNode;
};

/** Plain section heading — no inset panel background. */
export function UserGiftCardsSection({ title, children }: UserGiftCardsSectionProps) {
  return (
    <section className={USER_GIFT_CARDS_SECTION_CLASS}>
      <h2 className={USER_GIFT_CARDS_SECTION_TITLE_CLASS}>{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
