"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { UserGiftCardCopyCodeButton } from "@/components/account/user-gift-card-copy-code-button";
import { UserGiftCardDetailsSheet } from "@/components/account/user-gift-card-details-sheet";
import {
  GIFT_CARD_BOARD_GRID_CLASS,
  UserGiftCardsSection,
} from "@/components/account/user-gift-card-tile-layout";
import type { UserGiftCardSource } from "@/components/account/user-gift-cards-types";
import { GiftCardBoardTile, type GiftCardBoardDetail } from "@/components/gift-cards/gift-card-board-tile";
import { displayGiftCardDate } from "@/components/gift-cards/gift-card-display-helpers";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { OmmFilterDropdown } from "@/components/ui/omm-select-dropdown";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { UserGiftCardWithSource } from "@/lib/merge-user-gift-cards";
import {
  parseUserGiftCardSortOrder,
  sortUserGiftCards,
  USER_GIFT_CARD_SORT_ORDERS,
} from "@/lib/list-sort";
import {
  readUserListOrderFromSearch,
  syncUserListOrderQuery,
} from "@/lib/user-list-order-url";
import { formatAmdFromCents } from "@/lib/price-amd";
import {
  parseUserGiftCardsMyPageParams,
  USER_GIFT_CARDS_MY_PAGE_KEYS,
} from "@/lib/user-gift-cards-query";
import { syncListPageQuery } from "@/lib/list-pagination";
type UserGiftCardsBoardProps = {
  locale: string;
  cards: readonly UserGiftCardWithSource[];
  loadError: number | null;
};

export function UserGiftCardsBoard({
  locale,
  cards,
  loadError,
}: UserGiftCardsBoardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedCard = useMemo(() => {
    if (selectedId === null) {
      return null;
    }
    return cards.find((card) => card.id === selectedId) ?? null;
  }, [cards, selectedId]);

  return (
    <>
      <MyGiftCardsSection
        locale={locale}
        cards={cards}
        loadError={loadError}
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

type MyGiftCardsSectionProps = {
  locale: string;
  cards: readonly UserGiftCardWithSource[];
  loadError: number | null;
  onSelect: (id: string) => void;
};

function MyGiftCardsSection({
  locale,
  cards,
  loadError,
  onSelect,
}: MyGiftCardsSectionProps) {
  const t = useTranslations("userPages.giftCards");
  const tSort = useTranslations("listSort");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState(() =>
    readUserListOrderFromSearch(Object.fromEntries(searchParams.entries()), "giftCard", "newest"),
  );

  const sortOptions = useMemo(
    () =>
      USER_GIFT_CARD_SORT_ORDERS.map((value) => ({
        value,
        label:
          value === "expirationSoon"
            ? tSort("expirationSoon")
            : value === "oldest"
              ? tSort("oldest")
              : tSort("newest"),
      })),
    [tSort],
  );

  const listPage = useMemo(
    () =>
      parseUserGiftCardsMyPageParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const setPage = useCallback(
    (page: number, pageSize?: number) => {
      const params = new URLSearchParams(searchParams.toString());
      syncListPageQuery(params, page, pageSize, USER_GIFT_CARDS_MY_PAGE_KEYS);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const sortedCards = useMemo(
    () => sortUserGiftCards(cards, order),
    [cards, order],
  );

  const visibleCards = useMemo(() => {
    const start = listPage.offset;
    return sortedCards.slice(start, start + listPage.take);
  }, [listPage.offset, listPage.take, sortedCards]);

  function handleSortChange(value: string): void {
    const nextOrder = parseUserGiftCardSortOrder(value);
    setOrder(nextOrder);
    const params = new URLSearchParams(searchParams.toString());
    syncListPageQuery(params, 1, undefined, USER_GIFT_CARDS_MY_PAGE_KEYS);
    syncUserListOrderQuery(params, value, "newest");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <UserGiftCardsSection title={t("myCardsHeading")}>
      {cards.length > 0 ? (
        <div className="mb-4 flex justify-end">
          <OmmFilterDropdown
            allValue="newest"
            value={order}
            ariaLabel={tSort("sort")}
            allLabel={tSort("newest")}
            onChange={handleSortChange}
            options={sortOptions.filter((option) => option.value !== "newest")}
          />
        </div>
      ) : null}
      {loadError !== null ? (
        <div className="app-alert-warn text-sm">
          {loadError === 401 || loadError === 403
            ? t("signInRequired")
            : t("loadError", { status: loadError })}
        </div>
      ) : cards.length === 0 ? (
        <div className="rounded-[20px] border border-white/60 bg-white/75 p-5 sm:p-6">
          <p className="font-medium text-sage-900">{t("emptyMyTitle")}</p>
          <p className="ommm-body-muted mt-2 text-sm">{t("emptyMyDescription")}</p>
        </div>
      ) : (
        <>
          <div className={GIFT_CARD_BOARD_GRID_CLASS}>
            {visibleCards.map((card) => (
              <UserGiftCardTile
                key={card.id}
                card={card}
                locale={locale}
                onSelect={onSelect}
              />
            ))}
          </div>
          <OmmListPagination
            total={sortedCards.length}
            page={listPage.page}
            pageSize={listPage.pageSize}
            offset={listPage.offset}
            onPageChange={setPage}
            onPageSizeChange={(pageSize) => setPage(1, pageSize)}
            namespace="userPages.pagination"
          />
        </>
      )}
    </UserGiftCardsSection>
  );
}

function UserGiftCardTile({
  card,
  locale,
  onSelect,
}: {
  card: UserGiftCardWithSource;
  locale: string;
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

  if (card.source === "purchased" && recipient.length > 0) {
    details.push({ label: t("cardRecipient"), value: recipient });
  }

  if (card.source === "received" && card.message) {
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
      imageBadge={{
        label: t(`sourceLabels.${card.source}`),
        className: sourceBadgeClass(card.source),
      }}
      openAriaLabel={t("openCardAria", { amount: amountLabel })}
      onOpen={() => onSelect(card.id)}
      details={details}
      imageOverlayActions={
        <UserGiftCardCopyCodeButton code={card.code} feedbackOnDark />
      }
    />
  );
}

function sourceBadgeClass(source: UserGiftCardSource): string {
  if (source === "purchased") {
    return "bg-sand-100/95 text-sage-800";
  }
  return "bg-mint-100/95 text-sage-900";
}
