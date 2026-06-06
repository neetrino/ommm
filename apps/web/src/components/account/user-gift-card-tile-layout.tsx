import type { ReactNode } from "react";

/** Shared grid for market, purchased, and received gift card tiles. */
export const USER_GIFT_CARD_GRID_CLASS = "grid gap-6 lg:grid-cols-2";

export const USER_GIFT_CARD_TILE_SHELL_CLASS = [
  "rounded-[32px] border border-white/80 bg-white/95 p-6",
  "shadow-[0_22px_54px_-34px_rgba(45,40,35,0.34)]",
  "sm:p-7",
].join(" ");

export const USER_GIFT_CARD_TILE_INTERACTIVE_CLASS = [
  USER_GIFT_CARD_TILE_SHELL_CLASS,
  "group cursor-pointer transition-all",
  "hover:-translate-y-0.5 hover:border-white hover:shadow-[0_28px_64px_-34px_rgba(45,40,35,0.4)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
].join(" ");

export const USER_GIFT_CARD_TILE_IMAGE_FRAME_CLASS = [
  "relative aspect-[16/9] w-full overflow-hidden rounded-[22px]",
  "border border-white/70 bg-sage-100 shadow-[0_14px_26px_-18px_rgba(45,40,35,0.45)]",
].join(" ");

export const USER_GIFT_CARD_TILE_BODY_CLASS = "mt-6 space-y-5";

export const USER_GIFT_CARD_TILE_HEADER_CLASS = "flex items-center justify-between gap-4";

export const USER_GIFT_CARD_TILE_AMOUNT_CLASS =
  "text-2xl font-semibold tracking-tight text-sage-950";

export const USER_GIFT_CARD_TILE_META_DL_CLASS = "grid gap-2.5 text-lg text-sage-700";

export const USER_GIFT_CARD_TILE_META_ROW_CLASS =
  "flex items-center justify-between gap-4";

export const USER_GIFT_CARD_TILE_META_LABEL_CLASS = "text-sage-600";

export const USER_GIFT_CARD_TILE_META_VALUE_CLASS = "text-right text-sage-800";

export const USER_GIFT_CARD_STATUS_BADGE_CLASS =
  "px-3 py-1 text-sm leading-none";

export const USER_GIFT_CARDS_SECTION_CLASS = "mt-10 first:mt-0";

export const USER_GIFT_CARDS_SECTION_TITLE_CLASS = "ommm-h3 text-sage-800";

type UserGiftCardsSectionProps = {
  title: string;
  children: ReactNode;
};

/** Plain section heading — no inset panel background (matches Purchased / Received). */
export function UserGiftCardsSection({ title, children }: UserGiftCardsSectionProps) {
  return (
    <section className={USER_GIFT_CARDS_SECTION_CLASS}>
      <h2 className={USER_GIFT_CARDS_SECTION_TITLE_CLASS}>{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
