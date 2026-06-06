"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { UserGiftCardCopyCodeButton } from "@/components/account/user-gift-card-copy-code-button";
import { UserGiftCardDetailsSheet } from "@/components/account/user-gift-card-details-sheet";
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
    <section className="mt-10 first:mt-0">
      <h2 className="ommm-h3 text-sage-800">{heading}</h2>
      {errorStatus !== null ? (
        <div className="app-alert-warn mt-4 text-sm">
          {errorStatus === 401 || errorStatus === 403
            ? t("signInRequired")
            : t("loadError", { status: errorStatus })}
        </div>
      ) : cards.length === 0 ? (
        <div className="mt-4 rounded-[20px] border border-white/60 bg-white/75 p-5 sm:p-6">
          <p className="font-medium text-sage-900">{emptyTitle}</p>
          <p className="ommm-body-muted mt-2 text-sm">{emptyDescription}</p>
        </div>
      ) : (
        <UserGiftCardGrid locale={locale} cards={cards} kind={kind} onSelect={onSelect} />
      )}
    </section>
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
    <div className="mt-5 grid gap-6 lg:grid-cols-2">
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
      className="group cursor-pointer rounded-[32px] border border-white/80 bg-white/95 p-6 shadow-[0_22px_54px_-34px_rgba(45,40,35,0.34)] transition-all hover:-translate-y-0.5 hover:border-white hover:shadow-[0_28px_64px_-34px_rgba(45,40,35,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:p-7"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[22px] border border-white/70 bg-sage-100 shadow-[0_14px_26px_-18px_rgba(45,40,35,0.45)]">
        <GiftCardThumbnail
          imageUrl={card.imageUrl}
          alt={t("cardImageAlt")}
          fallbackLabel={t("cardImageFallback")}
        />
        <div className="pointer-events-none absolute inset-0 flex items-start justify-end bg-gradient-to-b from-sage-900/25 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <UserGiftCardCopyCodeButton code={card.code} stopClickPropagation className="pointer-events-auto" />
        </div>
      </div>
      <div className="mt-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-2xl font-semibold tracking-tight text-sage-950">{amountLabel}</p>
          <span className={`${giftCardStatusBadgeClass(card.status)} px-3 py-1 text-sm leading-none`}>
            {t(`statusValues.${card.status}`)}
          </span>
        </div>
        <dl className="grid gap-2.5 text-lg text-sage-700">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-sage-600">{t("cardCreated")}</dt>
            <dd className="text-right text-sage-800">{displayGiftCardDate(card.createdAt)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-sage-600">{t("cardExpiration")}</dt>
            <dd className="text-right text-sage-800">
              {card.expiresAt !== null
                ? displayGiftCardDate(card.expiresAt)
                : t("cardNoExpiration")}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-sage-600">{t("cardBalance")}</dt>
            <dd className="text-right text-sage-800">{balanceLabel}</dd>
          </div>
          {kind === "purchased" && recipient.length > 0 ? (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sage-600">{t("cardRecipient")}</dt>
              <dd className="truncate text-right text-sage-800">{recipient}</dd>
            </div>
          ) : null}
          {kind === "received" && card.message ? (
            <div className="flex items-start justify-between gap-4">
              <dt className="shrink-0 text-sage-600">{t("cardMessage")}</dt>
              <dd className="line-clamp-2 text-right text-sage-800">{card.message}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </article>
  );
}
