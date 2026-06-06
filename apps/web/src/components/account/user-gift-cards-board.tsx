"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { UserGiftCardCopyCodeButton } from "@/components/account/user-gift-card-copy-code-button";
import { UserGiftCardDetailsSheet } from "@/components/account/user-gift-card-details-sheet";
import {
  GIFT_CARD_BOARD_GRID_CLASS,
  UserGiftCardsSection,
} from "@/components/account/user-gift-card-tile-layout";
import type {
  UserGiftCardRow,
  UserGiftCardSectionKind,
} from "@/components/account/user-gift-cards-types";
import { GiftCardBoardTile, type GiftCardBoardDetail } from "@/components/gift-cards/gift-card-board-tile";
import { displayGiftCardDate } from "@/components/gift-cards/gift-card-display-helpers";
import { formatAmdFromCents } from "@/lib/price-amd";

type UserGiftCardsBoardProps = {
  locale: string;
  purchased: readonly UserGiftCardRow[];
  received: readonly UserGiftCardRow[];
  purchasedError: number | null;
  receivedError: number | null;
};

export function UserGiftCardsBoard({
  locale,
  purchased,
  received,
  purchasedError,
  receivedError,
}: UserGiftCardsBoardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedCard = useMemo(() => {
    if (selectedId === null) {
      return null;
    }
    return (
      [...purchased, ...received].find((card) => card.id === selectedId) ?? null
    );
  }, [purchased, received, selectedId]);

  return (
    <>
      <UserGiftCardSection
        kind="purchased"
        locale={locale}
        cards={purchased}
        errorStatus={purchasedError}
        onSelect={setSelectedId}
      />
      <UserGiftCardSection
        kind="received"
        locale={locale}
        cards={received}
        errorStatus={receivedError}
        onSelect={setSelectedId}
      />
      <UserGiftCardDetailsSheet
        card={selectedCard}
        locale={locale}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}

type UserGiftCardSectionProps = {
  kind: UserGiftCardSectionKind;
  locale: string;
  cards: readonly UserGiftCardRow[];
  errorStatus: number | null;
  onSelect: (id: string) => void;
};

function UserGiftCardSection({
  kind,
  locale,
  cards,
  errorStatus,
  onSelect,
}: UserGiftCardSectionProps) {
  const t = useTranslations("userPages.giftCards");
  const heading = kind === "purchased" ? t("purchasedHeading") : t("receivedHeading");
  const emptyTitle =
    kind === "purchased" ? t("emptyPurchasedTitle") : t("emptyReceivedTitle");
  const emptyDescription =
    kind === "purchased" ? t("emptyPurchasedDescription") : t("emptyReceivedDescription");

  return (
    <UserGiftCardsSection title={heading}>
      {errorStatus !== null ? (
        <div className="app-alert-warn text-sm">
          {errorStatus === 401 || errorStatus === 403
            ? t("signInRequired")
            : t("loadError", { status: errorStatus })}
        </div>
      ) : cards.length === 0 ? (
        <div className="rounded-[20px] border border-white/60 bg-white/75 p-5 sm:p-6">
          <p className="font-medium text-sage-900">{emptyTitle}</p>
          <p className="ommm-body-muted mt-2 text-sm">{emptyDescription}</p>
        </div>
      ) : (
        <UserGiftCardGrid locale={locale} cards={cards} kind={kind} onSelect={onSelect} />
      )}
    </UserGiftCardsSection>
  );
}

type UserGiftCardGridProps = {
  locale: string;
  cards: readonly UserGiftCardRow[];
  kind: UserGiftCardSectionKind;
  onSelect: (id: string) => void;
};

function UserGiftCardGrid({ locale, cards, kind, onSelect }: UserGiftCardGridProps) {
  return (
    <div className={GIFT_CARD_BOARD_GRID_CLASS}>
      {cards.map((card) => (
        <UserGiftCardTile
          key={card.id}
          card={card}
          locale={locale}
          kind={kind}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function UserGiftCardTile({
  card,
  locale,
  kind,
  onSelect,
}: {
  card: UserGiftCardRow;
  locale: string;
  kind: UserGiftCardSectionKind;
  onSelect: (id: string) => void;
}) {
  const t = useTranslations("userPages.giftCards");
  const amountLabel = formatAmdFromCents(card.amountCents, locale);
  const balanceLabel = formatAmdFromCents(card.balanceCents, locale);
  const recipient =
    card.recipientName?.trim() || card.recipientEmail?.trim() || "";

  const details: GiftCardBoardDetail[] = [
    { label: t("cardCreated"), value: displayGiftCardDate(card.createdAt) },
    {
      label: t("cardExpiration"),
      value:
        card.expiresAt !== null ? displayGiftCardDate(card.expiresAt) : t("cardNoExpiration"),
    },
    { label: t("cardBalance"), value: balanceLabel },
  ];

  if (kind === "purchased" && recipient.length > 0) {
    details.push({ label: t("cardRecipient"), value: recipient });
  }

  if (kind === "received" && card.message) {
    details.push({
      label: t("cardMessage"),
      value: card.message,
      valueClassName: "line-clamp-2 whitespace-normal",
    });
  }

  return (
    <GiftCardBoardTile
      amountLabel={amountLabel}
      status={card.status}
      statusLabel={t(`statusValues.${card.status}`)}
      imageUrl={card.imageUrl}
      imageAlt={t("cardImageAlt")}
      imageFallbackLabel={t("cardImageFallback")}
      openAriaLabel={t("openCardAria", { amount: amountLabel })}
      onOpen={() => onSelect(card.id)}
      details={details}
      imageOverlayActions={
        <UserGiftCardCopyCodeButton code={card.code} feedbackOnDark />
      }
    />
  );
}
