"use client";

import { useTranslations } from "next-intl";
import type { UserGiftCardWithSource } from "@/lib/merge-user-gift-cards";
import { Link } from "@/i18n/navigation";
import {
  giftCardStatusBadgeClass,
  isGiftCardDateExpired,
} from "@/components/gift-cards/gift-card-display-helpers";
import { ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS } from "@/components/admin/admin-details-sheet-layout";
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
                  : "border-mint-200 bg-mint-50 text-sage-900"
              }`}
            >
              {expired ? t("drawerExpired") : t("drawerValid")}
            </span>
          ) : null}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <MetricCard label={t("cardAmount")} value={amountLabel} />
        <MetricCard label={t("cardBalance")} value={balanceLabel} />
      </div>

      {canSpendGiftCard(card, expired) ? <GiftCardUseNow label={t("useNow")} /> : null}

      <UserGiftCardSheetFacts card={card} />
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

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/60 bg-white/75 p-4 shadow-[0_12px_28px_-20px_rgba(45,40,35,0.16)]">
      <p className={ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS}>{label}</p>
      <p className="mt-1 text-lg font-semibold text-sage-900">{value}</p>
    </div>
  );
}
