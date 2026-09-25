"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { memberChrome } from "@/components/account/member-chrome";
import { UserGiftCardDetailsSheet } from "@/components/account/user-gift-card-details-sheet";
import {
  GIFT_CARD_BOARD_GRID_CLASS,
  UserGiftCardsSection,
} from "@/components/account/user-gift-card-tile-layout";
import type { UserGiftCardWithSource } from "@/lib/merge-user-gift-cards";
import { GiftCardBoardTile, type GiftCardBoardDetail } from "@/components/gift-cards/gift-card-board-tile";
import { displayGiftCardDate } from "@/components/gift-cards/gift-card-display-helpers";
import { AdminNavIcon } from "@/components/shell/admin-nav-icon";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { usePathname, useRouter } from "@/i18n/navigation";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
    () => [...cards].sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    [cards],
  );

  const visibleCards = useMemo(() => {
    const start = listPage.offset;
    return sortedCards.slice(start, start + listPage.take);
  }, [listPage.offset, listPage.take, sortedCards]);

  return (
    <UserGiftCardsSection title={t("myCardsHeading")}>
      {loadError !== null ? (
        <div className="app-alert-warn text-sm">
          {loadError === 401 || loadError === 403
            ? t("signInRequired")
            : t("loadError", { status: loadError })}
        </div>
      ) : cards.length === 0 ? (
        <MyGiftCardsEmptyPanel
          title={t("emptyMyTitle")}
          description={t("emptyMyDescription")}
        />
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
            namespace="userPages.pagination"
          />
        </>
      )}
    </UserGiftCardsSection>
  );
}

function MyGiftCardsEmptyPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className={`${memberChrome.surface} flex flex-col items-center px-6 py-10 text-center sm:px-10 sm:py-12`}
      role="status"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-sand-100/90 text-sage-700 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.9)]">
        <AdminNavIcon slug="giftCards" className="h-6 w-6" />
      </span>
      <p className="ommm-h3 mt-5 text-sage-800">{title}</p>
      <p className="ommm-body-muted mt-2 max-w-md text-sm">{description}</p>
    </div>
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
      openAriaLabel={t("openCardAria", { amount: amountLabel })}
      onOpen={() => onSelect(card.id)}
      details={details}
    />
  );
}
