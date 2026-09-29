"use client";

import { useTranslations } from "next-intl";
import {
  GIFT_CARD_STATUSES,
  type GiftCardStatus,
} from "@/components/admin/admin-gift-cards-types";
import type { ClientSheetGiftCardItem } from "@/components/admin/admin-clients-types";
import {
  GiftCardBoardTile,
  type GiftCardBoardDetail,
} from "@/components/gift-cards/gift-card-board-tile";
import { displayGiftCardDate } from "@/components/gift-cards/gift-card-display-helpers";
import { formatAmdFromCents } from "@/lib/price-amd";

const GIFT_CARD_CODE_CLASS = "font-mono text-base tracking-[0.12em] text-sage-900";

const EMPTY_SURFACE_CLASS =
  "rounded-[24px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md sm:p-5";

type ClientGiftCardsBoardProps = {
  locale: string;
  cards: readonly ClientSheetGiftCardItem[];
  empty: string;
};

/** Client-sheet gift cards, using the same artwork tiles as the gift-card board. */
export function ClientGiftCardsBoard({ locale, cards, empty }: ClientGiftCardsBoardProps) {
  const tClients = useTranslations("adminPages.clients");
  const title = tClients("drawer.giftCards");

  if (cards.length === 0) {
    return (
      <section className={EMPTY_SURFACE_CLASS}>
        <p className="font-medium text-sage-900">{title}</p>
        <p className="mt-2 text-sm text-sage-500">{empty}</p>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      <p className="font-medium text-sage-900">{title}</p>
      <div className="grid grid-cols-1 gap-4">
        {cards.map((card) => (
          <ClientGiftCardBanner key={card.id} card={card} locale={locale} />
        ))}
      </div>
    </div>
  );
}

function ClientGiftCardBanner({
  card,
  locale,
}: {
  card: ClientSheetGiftCardItem;
  locale: string;
}) {
  const t = useTranslations("adminPages.giftCards");
  const tClients = useTranslations("adminPages.clients");
  const amountLabel = formatAmdFromCents(card.amountCents, locale);
  const relationLabel =
    card.relation === "purchased"
      ? tClients("drawer.giftPurchased")
      : tClients("drawer.giftReceived");

  return (
    <GiftCardBoardTile
      amountLabel={amountLabel}
      status={card.status}
      statusLabel={giftStatusLabel(t, card.status)}
      imageAlt={t("cardImageAlt")}
      code={card.code}
      imageBadge={{ label: relationLabel }}
      details={giftCardDetails(t, card, locale)}
    />
  );
}

function giftCardDetails(
  t: ReturnType<typeof useTranslations<"adminPages.giftCards">>,
  card: ClientSheetGiftCardItem,
  locale: string,
): GiftCardBoardDetail[] {
  return [
    { label: t("colCode"), value: card.code, valueClassName: GIFT_CARD_CODE_CLASS },
    { label: t("colBalance"), value: formatAmdFromCents(card.balanceCents, locale) },
    { label: t("colCreated"), value: displayGiftCardDate(card.createdAt) },
    { label: t("colExpiration"), value: displayGiftCardDate(card.expiresAt) },
    {
      label: t("colRecipient"),
      value: card.recipientName ?? card.recipientEmail ?? "—",
    },
  ];
}

function giftStatusLabel(
  t: ReturnType<typeof useTranslations<"adminPages.giftCards">>,
  status: string,
): string {
  if (!isGiftCardStatus(status)) {
    return status;
  }
  return t(`statusValues.${status}`);
}

function isGiftCardStatus(status: string): status is GiftCardStatus {
  return (GIFT_CARD_STATUSES as readonly string[]).includes(status);
}
