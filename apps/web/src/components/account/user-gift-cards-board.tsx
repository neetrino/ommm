"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { UserGiftCardCopyCodeButton } from "@/components/account/user-gift-card-copy-code-button";
import { UserGiftCardDetailsSheet } from "@/components/account/user-gift-card-details-sheet";
import {
  USER_GIFT_CARD_GRID_CLASS,
  USER_GIFT_CARD_STATUS_BADGE_CLASS,
  USER_GIFT_CARD_TILE_AMOUNT_CLASS,
  USER_GIFT_CARD_TILE_BODY_CLASS,
  USER_GIFT_CARD_TILE_HEADER_CLASS,
  USER_GIFT_CARD_TILE_IMAGE_FRAME_CLASS,
  USER_GIFT_CARD_TILE_INTERACTIVE_CLASS,
  USER_GIFT_CARD_TILE_META_DL_CLASS,
  USER_GIFT_CARD_TILE_META_LABEL_CLASS,
  USER_GIFT_CARD_TILE_META_ROW_CLASS,
  USER_GIFT_CARD_TILE_META_VALUE_CLASS,
  UserGiftCardsSection,
} from "@/components/account/user-gift-card-tile-layout";
import type {
  UserGiftCardRow,
  UserGiftCardSectionKind,
} from "@/components/account/user-gift-cards-types";
import {
  displayGiftCardDate,
  giftCardStatusBadgeClass,
} from "@/components/gift-cards/gift-card-display-helpers";
import { GiftCardThumbnail } from "@/components/gift-cards/gift-card-thumbnail";
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
    <div className={USER_GIFT_CARD_GRID_CLASS}>
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

  function openDetails() {
    onSelect(card.id);
  }

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={t("openCardAria", { amount: amountLabel })}
      onClick={openDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetails();
        }
      }}
      className={USER_GIFT_CARD_TILE_INTERACTIVE_CLASS}
    >
      <div className={USER_GIFT_CARD_TILE_IMAGE_FRAME_CLASS}>
        <GiftCardThumbnail
          imageUrl={card.imageUrl}
          alt={t("cardImageAlt")}
          fallbackLabel={t("cardImageFallback")}
        />
        <div className="pointer-events-none absolute inset-0 flex items-start justify-end bg-gradient-to-b from-sage-900/25 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <UserGiftCardCopyCodeButton code={card.code} stopClickPropagation className="pointer-events-auto" />
        </div>
      </div>
      <div className={USER_GIFT_CARD_TILE_BODY_CLASS}>
        <div className={USER_GIFT_CARD_TILE_HEADER_CLASS}>
          <p className={USER_GIFT_CARD_TILE_AMOUNT_CLASS}>{amountLabel}</p>
          <span
            className={`${giftCardStatusBadgeClass(card.status)} ${USER_GIFT_CARD_STATUS_BADGE_CLASS}`}
          >
            {t(`statusValues.${card.status}`)}
          </span>
        </div>
        <dl className={USER_GIFT_CARD_TILE_META_DL_CLASS}>
          <div className={USER_GIFT_CARD_TILE_META_ROW_CLASS}>
            <dt className={USER_GIFT_CARD_TILE_META_LABEL_CLASS}>{t("cardCreated")}</dt>
            <dd className={USER_GIFT_CARD_TILE_META_VALUE_CLASS}>
              {displayGiftCardDate(card.createdAt)}
            </dd>
          </div>
          <div className={USER_GIFT_CARD_TILE_META_ROW_CLASS}>
            <dt className={USER_GIFT_CARD_TILE_META_LABEL_CLASS}>{t("cardExpiration")}</dt>
            <dd className={USER_GIFT_CARD_TILE_META_VALUE_CLASS}>
              {card.expiresAt !== null
                ? displayGiftCardDate(card.expiresAt)
                : t("cardNoExpiration")}
            </dd>
          </div>
          <div className={USER_GIFT_CARD_TILE_META_ROW_CLASS}>
            <dt className={USER_GIFT_CARD_TILE_META_LABEL_CLASS}>{t("cardBalance")}</dt>
            <dd className={USER_GIFT_CARD_TILE_META_VALUE_CLASS}>{balanceLabel}</dd>
          </div>
          {kind === "purchased" && recipient.length > 0 ? (
            <div className={USER_GIFT_CARD_TILE_META_ROW_CLASS}>
              <dt className={USER_GIFT_CARD_TILE_META_LABEL_CLASS}>{t("cardRecipient")}</dt>
              <dd className={`truncate ${USER_GIFT_CARD_TILE_META_VALUE_CLASS}`}>{recipient}</dd>
            </div>
          ) : null}
          {kind === "received" && card.message ? (
            <div className="flex items-start justify-between gap-4">
              <dt className={`shrink-0 ${USER_GIFT_CARD_TILE_META_LABEL_CLASS}`}>
                {t("cardMessage")}
              </dt>
              <dd className={`line-clamp-2 ${USER_GIFT_CARD_TILE_META_VALUE_CLASS}`}>
                {card.message}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </article>
  );
}
