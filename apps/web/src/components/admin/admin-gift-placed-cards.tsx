"use client";

import { useMemo, useState } from "react";
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
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import type { IntegratedFilterField } from "@/components/shared/search/integrated-search-filter-types";
import { parseFilterMultiValue } from "@/lib/filter-multi-value";
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

const PLACED_KIND_FILTER_KEY = "kind";
const PLACED_KIND_PURCHASED = "purchased";
const PLACED_KIND_GIFTED = "gifted";

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
  const [kinds, setKinds] = useState("");
  const [search, setSearch] = useState("");
  const visible = filterPlacedCards(cards, kinds, search, locale);

  return (
    <>
      <AdminPageHero
        title={t("placedTitle")}
        titleBackHref={ADMIN_GIFT_CARDS_PATH}
        titleBackLabel={t("placedBack")}
        search={
          <PlacedCardsFilterBar
            kinds={kinds}
            search={search}
            onKindsChange={setKinds}
            onSearchChange={setSearch}
          />
        }
      />
      <div className="mt-4">
        <PlacedCardsGrid cards={visible} locale={locale} empty={t("placedEmpty")} />
      </div>
    </>
  );
}

function PlacedCardsFilterBar({
  kinds,
  search,
  onKindsChange,
  onSearchChange,
}: {
  kinds: string;
  search: string;
  onKindsChange: (kinds: string) => void;
  onSearchChange: (search: string) => void;
}) {
  const t = useTranslations("adminPages.giftCards");
  const tFilters = useTranslations("adminPages.giftCards.filters");
  const fields = useMemo(() => [placedKindField(t)], [t]);

  return (
    <ListPageSearchFilters
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder={tFilters("searchPlaceholder")}
      fields={fields}
      filterValues={{ [PLACED_KIND_FILTER_KEY]: kinds }}
      onFilterChange={changePlacedKindFilter(onKindsChange)}
      onClearAll={() => {
        onSearchChange("");
        onKindsChange("");
      }}
      resetLabel={tFilters("reset")}
    />
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

function placedKindField(
  t: ReturnType<typeof useTranslations<"adminPages.giftCards">>,
): IntegratedFilterField {
  return {
    key: PLACED_KIND_FILTER_KEY,
    label: t("placedFilterLabel"),
    emptyValue: "",
    allLabel: t("placedFilterAll"),
    options: [
      { value: PLACED_KIND_PURCHASED, label: t("placedFilterPurchased") },
      { value: PLACED_KIND_GIFTED, label: t("placedFilterGifted") },
    ],
  };
}

function changePlacedKindFilter(onKindsChange: (kinds: string) => void) {
  return (key: string, value: string) => {
    if (key === PLACED_KIND_FILTER_KEY) {
      onKindsChange(value);
    }
  };
}

function filterPlacedCards(
  cards: readonly PlacedGiftCard[],
  kinds: string,
  search: string,
  locale: string,
): PlacedGiftCard[] {
  return selectPlacedGiftCards(cards).filter(
    (card) => matchesPlacedKinds(card, kinds) && matchesPlacedSearch(card, search, locale),
  );
}

function matchesPlacedSearch(card: PlacedGiftCard, search: string, locale: string): boolean {
  const needle = search.trim().toLowerCase();
  if (needle.length === 0) {
    return true;
  }
  const haystack = [
    personLabel(card.purchaser, null, null),
    personLabel(card.recipient, card.recipientName, card.recipientEmail),
    card.status,
    formatAmdFromCents(card.amountAmd, locale),
    formatAmdFromCents(card.balanceAmd, locale),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
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

function matchesPlacedKinds(card: PlacedGiftCard, kinds: string): boolean {
  const selected = parseFilterMultiValue(kinds);
  if (selected.length === 0) {
    return true;
  }
  return selected.some((kind) => placedKindMatches(card, kind));
}

function placedKindMatches(card: PlacedGiftCard, kind: string): boolean {
  if (kind === PLACED_KIND_PURCHASED) {
    return isPurchasedCard(card);
  }
  if (kind === PLACED_KIND_GIFTED) {
    return isGiftedCard(card);
  }
  return false;
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
