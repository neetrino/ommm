"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
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
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { usePathname, useRouter } from "@/i18n/navigation";
import { formatAmdFromCents } from "@/lib/price-amd";
import {
  buildUserGiftCardsPurchasedEndpoint,
  buildUserGiftCardsReceivedEndpoint,
  USER_GIFT_CARDS_PURCHASED_PAGE_KEYS,
  USER_GIFT_CARDS_RECEIVED_PAGE_KEYS,
  type UserGiftCardsSectionPayload,
} from "@/lib/user-gift-cards-query";
import { apiFetch } from "@/lib/api";
import { parseListPageParams, syncListPageQuery } from "@/lib/list-pagination";

type UserGiftCardsBoardProps = {
  locale: string;
  initialPurchased: UserGiftCardsSectionPayload;
  initialReceived: UserGiftCardsSectionPayload;
  purchasedError: number | null;
  receivedError: number | null;
};

export function UserGiftCardsBoard({
  locale,
  initialPurchased,
  initialReceived,
  purchasedError,
  receivedError,
}: UserGiftCardsBoardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const purchased = initialPurchased.items;
  const received = initialReceived.items;

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
      <PaginatedGiftCardSection
        kind="purchased"
        locale={locale}
        initial={initialPurchased}
        errorStatus={purchasedError}
        onSelect={setSelectedId}
      />
      <PaginatedGiftCardSection
        kind="received"
        locale={locale}
        initial={initialReceived}
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

type PaginatedGiftCardSectionProps = {
  kind: UserGiftCardSectionKind;
  locale: string;
  initial: UserGiftCardsSectionPayload;
  errorStatus: number | null;
  onSelect: (id: string) => void;
};

function PaginatedGiftCardSection({
  kind,
  locale,
  initial,
  errorStatus,
  onSelect,
}: PaginatedGiftCardSectionProps) {
  const t = useTranslations("userPages.giftCards");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState(initial);
  const [loading, startTransition] = useTransition();
  const requestId = useRef(0);
  const hasMounted = useRef(false);

  const pageKeys =
    kind === "purchased"
      ? USER_GIFT_CARDS_PURCHASED_PAGE_KEYS
      : USER_GIFT_CARDS_RECEIVED_PAGE_KEYS;
  const listPage = useMemo(
    () =>
      parseListPageParams(Object.fromEntries(searchParams.entries()), pageKeys),
    [pageKeys, searchParams],
  );

  useEffect(() => {
    setPayload(initial);
  }, [initial]);

  const setSectionPage = useCallback(
    (page: number, pageSize?: number) => {
      const params = new URLSearchParams(searchParams.toString());
      syncListPageQuery(params, page, pageSize, pageKeys);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pageKeys, pathname, router, searchParams],
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }

    const currentRequestId = ++requestId.current;
    startTransition(async () => {
      try {
        const endpoint =
          kind === "purchased"
            ? buildUserGiftCardsPurchasedEndpoint(listPage.take, listPage.offset)
            : buildUserGiftCardsReceivedEndpoint(listPage.take, listPage.offset);
        const data = await apiFetch<UserGiftCardsSectionPayload>(endpoint);
        if (currentRequestId !== requestId.current) {
          return;
        }
        setPayload(data);
      } catch {
        router.refresh();
      }
    });

    return undefined;
  }, [kind, listPage.offset, listPage.take, router, startTransition]);

  const heading = kind === "purchased" ? t("purchasedHeading") : t("receivedHeading");
  const emptyTitle =
    kind === "purchased" ? t("emptyPurchasedTitle") : t("emptyReceivedTitle");
  const emptyDescription =
    kind === "purchased" ? t("emptyPurchasedDescription") : t("emptyReceivedDescription");
  const cards = payload.items;

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
        <>
          <UserGiftCardGrid locale={locale} cards={cards} kind={kind} onSelect={onSelect} />
          <OmmListPagination
            total={payload.total}
            page={listPage.page}
            pageSize={listPage.pageSize}
            offset={payload.offset}
            onPageChange={setSectionPage}
            onPageSizeChange={(pageSize) => setSectionPage(1, pageSize)}
            disabled={loading}
            namespace="userPages.pagination"
          />
        </>
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
