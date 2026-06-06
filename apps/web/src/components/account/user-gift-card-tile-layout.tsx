import type { ReactNode } from "react";

/** Shared grid for market, purchased, and received gift card tiles. */
export const USER_GIFT_CARD_GRID_CLASS =
  "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export const USER_GIFT_CARD_TILE_SHELL_CLASS = [
  "rounded-[24px] border border-white/80 bg-white/95 p-4",
  "shadow-[0_16px_40px_-28px_rgba(45,40,35,0.3)]",
  "sm:p-5",
].join(" ");

export const USER_GIFT_CARD_TILE_INTERACTIVE_CLASS = [
  USER_GIFT_CARD_TILE_SHELL_CLASS,
  "group cursor-pointer transition-all",
  "hover:-translate-y-0.5 hover:border-white hover:shadow-[0_20px_48px_-28px_rgba(45,40,35,0.36)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
].join(" ");

export const USER_GIFT_CARD_TILE_IMAGE_FRAME_CLASS = [
  "relative aspect-[16/9] w-full overflow-hidden rounded-[16px]",
  "border border-white/70 bg-sage-100 shadow-[0_10px_20px_-14px_rgba(45,40,35,0.4)]",
].join(" ");

export const USER_GIFT_CARD_TILE_BODY_CLASS = "mt-4 space-y-3";

export const USER_GIFT_CARD_TILE_HEADER_CLASS = "flex items-center justify-between gap-2";

export const USER_GIFT_CARD_TILE_AMOUNT_CLASS =
  "text-lg font-semibold tracking-tight text-sage-950 sm:text-xl";

export const USER_GIFT_CARD_TILE_META_DL_CLASS = "grid gap-1.5 text-sm text-sage-700";

export const USER_GIFT_CARD_TILE_META_ROW_CLASS =
  "flex items-center justify-between gap-2";

export const USER_GIFT_CARD_TILE_META_LABEL_CLASS = "text-sage-600";

export const USER_GIFT_CARD_TILE_META_VALUE_CLASS = "text-right text-sage-800";

export const USER_GIFT_CARD_STATUS_BADGE_CLASS =
  "px-2 py-0.5 text-xs leading-none";

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
