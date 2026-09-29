"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { ADMIN_PAGE_HERO_PRIMARY_ACTION_BUTTON_CLASS } from "@/components/admin/admin-page-hero-action-button";
import {
  GIFT_CARD_STATUSES,
  type GiftCardStatus,
} from "@/components/admin/admin-gift-cards-types";
import {
  GIFT_CARD_BOARD_GRID_CLASS,
  GiftCardBoardTile,
  type GiftCardBoardDetail,
} from "@/components/gift-cards/gift-card-board-tile";
import { displayGiftCardDate } from "@/components/gift-cards/gift-card-display-helpers";
import { Link, usePathname } from "@/i18n/navigation";
import { formatAmdFromCents } from "@/lib/price-amd";

export const ADMIN_GIFT_CARDS_PATH = "/admin/gift-cards";
export const ADMIN_GIFT_CARDS_SOLD_PATH = `${ADMIN_GIFT_CARDS_PATH}/sold`;

type PlacedPerson = { email: string; name: string | null };

export type PlacedGiftCard = {
  id: string;
  amountAmd: number;
  balanceAmd: number;
  status: string;
  createdAt: string;
  expiresAt: string | null;
  purchaser: PlacedPerson | null;
  recipient: PlacedPerson | null;
  recipientName: string | null;
  recipientEmail: string | null;
};

type PlacedFilter = "all" | "purchased" | "gifted";

const FILTERS: readonly PlacedFilter[] = ["all", "purchased", "gifted"];

const CHIP_CLASS = "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em]";

/** Admin gift-card header link to the sold and gifted page. */
export function AdminGiftPlacedCardsButton() {
  const t = useTranslations("adminPages.giftCards");
  const pathname = usePathname();
  if (!pathname.startsWith(ADMIN_GIFT_CARDS_PATH)) {
    return null;
  }

  return (
    <Link
      href={ADMIN_GIFT_CARDS_SOLD_PATH}
      className={`ommm-cta-ghost ${ADMIN_PAGE_HERO_PRIMARY_ACTION_BUTTON_CLASS}`}
    >
      {t("placedButton")}
    </Link>
  );
}

type AdminGiftPlacedCardsPageProps = {
  cards: readonly PlacedGiftCard[];
};

/** Sold and gifted cards on their own admin route. */
export function AdminGiftPlacedCardsPage({ cards }: AdminGiftPlacedCardsPageProps) {
  const t = useTranslations("adminPages.giftCards");
  const locale = useLocale();
  const [filter, setFilter] = useState<PlacedFilter>("all");
  const visible = selectPlacedGiftCards(cards).filter((card) => matchesPlacedFilter(card, filter));

  return (
    <>
      <AdminPageHero
        title={t("placedTitle")}
        titleBackHref={ADMIN_GIFT_CARDS_PATH}
        titleBackLabel={t("placedBack")}
      />
      <div className="mt-4 space-y-4">
        <PlacedFilterChips filter={filter} onChange={setFilter} />
        <PlacedCardsGrid cards={visible} locale={locale} empty={t("placedEmpty")} />
      </div>
    </>
  );
}

function selectPlacedGiftCards(cards: readonly PlacedGiftCard[]): PlacedGiftCard[] {
  return cards.filter(isPlacedGiftCard);
}

function PlacedCardsGrid({
  cards,
  locale,
  empty,
}: {
  cards: readonly PlacedGiftCard[];
  locale: string;
  empty: string;
}) {
  if (cards.length === 0) {
    return <p className="text-sm text-sage-500">{empty}</p>;
  }
  return (
    <div className={GIFT_CARD_BOARD_GRID_CLASS}>
      {cards.map((card) => (
        <PlacedGiftCardTile key={card.id} card={card} locale={locale} />
      ))}
    </div>
  );
}

function PlacedGiftCardTile({ card, locale }: { card: PlacedGiftCard; locale: string }) {
  const t = useTranslations("adminPages.giftCards");
  return (
    <GiftCardBoardTile
      amountLabel={formatAmdFromCents(card.amountAmd, locale)}
      status={card.status}
      statusLabel={placedStatusLabel(t, card.status)}
      imageAlt={t("cardImageAlt")}
      details={placedDetails(t, card, locale)}
    />
  );
}

function PlacedFilterChips({
  filter,
  onChange,
}: {
  filter: PlacedFilter;
  onChange: (filter: PlacedFilter) => void;
}) {
  const t = useTranslations("adminPages.giftCards");
  const labels: Record<PlacedFilter, string> = {
    all: t("placedFilterAll"),
    purchased: t("placedFilterPurchased"),
    gifted: t("placedFilterGifted"),
  };
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={filter === value}
          className={`${CHIP_CLASS} ${filter === value ? "bg-sage-800 text-white" : "border border-sand-500/30 bg-white text-sage-700"}`}
          onClick={() => onChange(value)}
        >
          {labels[value]}
        </button>
      ))}
    </div>
  );
}

function placedDetails(
  t: ReturnType<typeof useTranslations<"adminPages.giftCards">>,
  card: PlacedGiftCard,
  locale: string,
): GiftCardBoardDetail[] {
  return [
    { label: t("placedBuyer"), value: personLabel(card.purchaser, null, null) },
    { label: t("colRecipient"), value: personLabel(card.recipient, card.recipientName, card.recipientEmail) },
    { label: t("colBalance"), value: formatAmdFromCents(card.balanceAmd, locale) },
    { label: t("colCreated"), value: displayGiftCardDate(card.createdAt) },
    { label: t("colExpiration"), value: displayGiftCardDate(card.expiresAt) },
  ];
}

function personLabel(
  person: PlacedPerson | null,
  fallbackName: string | null,
  fallbackEmail: string | null,
): string {
  const name = person?.name?.trim() || fallbackName?.trim() || "";
  if (name.length > 0) {
    return name;
  }
  const email = person?.email?.trim() || fallbackEmail?.trim() || "";
  return email.length > 0 ? email : "—";
}

function isPlacedGiftCard(card: PlacedGiftCard): boolean {
  return isPurchasedCard(card) || isGiftedCard(card);
}

function isPurchasedCard(card: PlacedGiftCard): boolean {
  return card.purchaser !== null;
}

function isGiftedCard(card: PlacedGiftCard): boolean {
  return (
    card.recipient !== null ||
    (card.recipientName?.trim().length ?? 0) > 0 ||
    (card.recipientEmail?.trim().length ?? 0) > 0
  );
}

function matchesPlacedFilter(card: PlacedGiftCard, filter: PlacedFilter): boolean {
  if (filter === "purchased") {
    return isPurchasedCard(card);
  }
  if (filter === "gifted") {
    return isGiftedCard(card);
  }
  return true;
}

function placedStatusLabel(
  t: ReturnType<typeof useTranslations<"adminPages.giftCards">>,
  status: string,
): string {
  if (!(GIFT_CARD_STATUSES as readonly string[]).includes(status)) {
    return status;
  }
  return t(`statusValues.${status as GiftCardStatus}`);
}
