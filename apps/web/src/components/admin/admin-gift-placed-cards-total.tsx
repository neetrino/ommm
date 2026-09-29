"use client";

import { useTranslations } from "next-intl";
import { AmdMoneyText } from "@/components/ui/amd-money-text";

type AdminGiftPlacedCardsTotalProps = {
  locale: string;
  totalAmountCents: number;
  totalCount: number;
};

const TOTAL_CARD_CLASS = [
  "relative w-full max-w-[20rem] overflow-hidden rounded-[22px]",
  "border border-white/70 bg-gradient-to-b from-white/85 via-white/70 to-white/55",
  "px-5 py-4 text-center shadow-[0_12px_32px_-24px_rgba(45,40,35,0.3)] backdrop-blur-md",
].join(" ");

const TOTAL_AMOUNT_CLASS =
  "mt-1 font-serif text-[clamp(1.6rem,3.5vw,2.15rem)] font-semibold leading-none tabular-nums text-sage-800";

/** Sales total for the sold and gifted gift-card list. */
export function AdminGiftPlacedCardsTotal({
  locale,
  totalAmountCents,
  totalCount,
}: AdminGiftPlacedCardsTotalProps) {
  const t = useTranslations("adminPages.giftCards");

  return (
    <section className="mt-4 flex justify-center px-1" aria-label={t("placedTotalAmount")}>
      <article className={TOTAL_CARD_CLASS}>
        <div
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-sand-300/70 to-transparent"
          aria-hidden
        />
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sage-500">
          {t("placedTotalAmount")}
        </p>
        <p className={TOTAL_AMOUNT_CLASS}>
          <AmdMoneyText cents={totalAmountCents} locale={locale} />
        </p>
        <p className="mt-2 text-xs font-medium text-sage-600">
          {t("placedTotalCount", { count: totalCount })}
        </p>
      </article>
    </section>
  );
}

export function placedCardsSalesTotal(cards: readonly { amountAmd: number }[]): {
  totalAmountCents: number;
  totalCount: number;
} {
  return {
    totalCount: cards.length,
    totalAmountCents: cards.reduce((sum, card) => sum + card.amountAmd, 0),
  };
}
