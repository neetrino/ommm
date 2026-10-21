"use client";

import { useTranslations } from "next-intl";
import type { UserGiftCardWithSource } from "@/lib/merge-user-gift-cards";
import { Link } from "@/i18n/navigation";
import {
  giftCardStatusBadgeClass,
  isGiftCardDateExpired,
} from "@/components/gift-cards/gift-card-display-helpers";
import {
  DetailsCard,
  DetailsStat,
  DetailsStatStrip,
} from "@/components/shared/details/details-card";
import { GiftGlyph, WalletGlyph } from "@/components/shared/details/details-glyphs";
import { formatAmdFromCents } from "@/lib/price-amd";
import { UserGiftCardHistory } from "@/components/account/user-gift-card-history";
import { UserGiftCardSheetFacts } from "@/components/account/user-gift-card-sheet-facts";
import { GiftCardFace } from "@/components/gift-cards/gift-card-face";

const SECTION_CLASS =
  "rounded-[24px] border border-white/60 bg-white/75 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.18)]";

type UserGiftCardSheetContentProps = {
  card: UserGiftCardWithSource;
  locale: string;
};

export function UserGiftCardSheetContent({ card, locale }: UserGiftCardSheetContentProps) {
  const t = useTranslations("userPages.giftCards");
  const amountLabel = formatAmdFromCents(card.amountCents, locale);
  const balanceLabel = formatAmdFromCents(card.balanceCents, locale);
  const expired = isGiftCardDateExpired(card.status, card.expiresAt);

  return (
    <div className="space-y-4">
      <section className={`${SECTION_CLASS} overflow-hidden`}>
        <GiftCardFace
          code={card.code}
          alt={t("cardImageAlt")}
          className="aspect-[1.58/1] w-full"
        />
        <div className="flex flex-wrap items-center gap-2 border-t border-white/60 px-4 py-3">
          <span className={giftCardStatusBadgeClass(card.status)}>
            {t(`statusValues.${card.status}`)}
          </span>
          {card.expiresAt !== null ? (
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${
                expired
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-mint-200 bg-mint-100 text-sage-900"
              }`}
            >
              {expired ? t("drawerExpired") : t("drawerValid")}
            </span>
          ) : null}
        </div>
      </section>

      <DetailsCard>
        <DetailsStatStrip columns={2} bordered={false}>
          <DetailsStat label={t("cardAmount")} icon={<GiftGlyph />} tone="mint">
            <span className="font-serif text-lg">{amountLabel}</span>
          </DetailsStat>
          <DetailsStat label={t("cardBalance")} icon={<WalletGlyph />} tone="peach">
            <span className="font-serif text-lg">{balanceLabel}</span>
          </DetailsStat>
        </DetailsStatStrip>
        {canSpendGiftCard(card, expired) ? <GiftCardUseNow label={t("useNow")} /> : null}
        <UserGiftCardSheetFacts card={card} />
      </DetailsCard>

      <UserGiftCardHistory code={card.code} locale={locale} />
    </div>
  );
}

function canSpendGiftCard(card: UserGiftCardWithSource, expired: boolean): boolean {
  return card.spendable && card.status === "ACTIVE" && card.balanceCents > 0 && !expired;
}

function GiftCardUseNow({ label }: { label: string }) {
  return (
    <Link href="/package" className="ommm-cta-primary inline-flex w-full justify-center">
      {label}
    </Link>
  );
}