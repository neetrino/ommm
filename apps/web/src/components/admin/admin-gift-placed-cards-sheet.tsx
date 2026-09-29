"use client";

import { useEffect, useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AdminPageHeroActionButton } from "@/components/admin/admin-page-hero-action-button";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_SHEET_PHONE_HIDE_CLOSE_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import {
  GIFT_CARD_STATUSES,
  type GiftCardStatus,
} from "@/components/admin/admin-gift-cards-types";
import { GiftCardBoardTile, type GiftCardBoardDetail } from "@/components/gift-cards/gift-card-board-tile";
import { displayGiftCardDate } from "@/components/gift-cards/gift-card-display-helpers";
import { ApiError, apiFetch } from "@/lib/api";
import { formatAmdFromCents } from "@/lib/price-amd";

type PlacedPerson = { email: string; name: string | null };

type PlacedGiftCard = {
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

/** Header button that opens every sold or gifted card. */
export function AdminGiftPlacedCardsButton() {
  const t = useTranslations("adminPages.giftCards");
  const [open, setOpen] = useState(false);

  return (
    <>
      <AdminPageHeroActionButton type="button" onClick={() => setOpen(true)}>
        {t("placedButton")}
      </AdminPageHeroActionButton>
      <AdminGiftPlacedCardsSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function AdminGiftPlacedCardsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("adminPages.giftCards");
  const titleId = useId();
  const cards = usePlacedGiftCards(open);
  const [filter, setFilter] = useState<PlacedFilter>("all");
  const visible = cards.rows.filter((card) => matchesPlacedFilter(card, filter));

  return (
    <AdminSheetPortal
      presentation="drawer"
      isOpen={open}
      onClose={onClose}
      backdropAriaLabel={t("modalBackdropClose")}
      ariaLabelledBy={titleId}
      drawerOverlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      drawerPanelClassName={ADMIN_WIDE_DRAWER_PANEL_CLASS}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
            {t("placedTitle")}
          </h2>
          <PlacedCloseButton label={t("modalCloseAria")} onClose={onClose} />
        </div>
        <PlacedFilterChips filter={filter} onChange={setFilter} />
      </header>
      <div className={ADMIN_DETAILS_SHEET_BODY_CLASS}>
        <PlacedCardsBody
          loading={cards.loading}
          error={cards.error}
          empty={t("placedEmpty")}
          cards={visible}
        />
      </div>
    </AdminSheetPortal>
  );
}

function usePlacedGiftCards(open: boolean) {
  const t = useTranslations("adminPages.giftCards");
  const [rows, setRows] = useState<PlacedGiftCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void apiFetch<PlacedGiftCard[]>("/gift-cards/admin")
      .then((next) => {
        if (!cancelled) {
          setRows(next.filter(isPlacedGiftCard));
        }
      })
      .catch((caught) => {
        if (!cancelled) {
          setRows([]);
          setError(caught instanceof ApiError ? caught.message : t("placedLoadFailed"));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, t]);

  return { rows, loading, error };
}

function PlacedCardsBody({
  loading,
  error,
  empty,
  cards,
}: {
  loading: boolean;
  error: string | null;
  empty: string;
  cards: readonly PlacedGiftCard[];
}) {
  const locale = useLocale();
  if (loading) {
    return <p className="text-sm text-sage-500">…</p>;
  }
  if (error !== null) {
    return <p className="text-sm text-red-800">{error}</p>;
  }
  if (cards.length === 0) {
    return <p className="text-sm text-sage-500">{empty}</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-4">
      {cards.map((card) => (
        <PlacedGiftCardTile key={card.id} card={card} locale={locale} />
      ))}
    </div>
  );
}

function PlacedGiftCardTile({ card, locale }: { card: PlacedGiftCard; locale: string }) {
  const t = useTranslations("adminPages.giftCards");
  const amountLabel = formatAmdFromCents(card.amountAmd, locale);
  return (
    <GiftCardBoardTile
      amountLabel={amountLabel}
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
    <div className="mt-4 flex flex-wrap gap-2">
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

function PlacedCloseButton({ label, onClose }: { label: string; onClose: () => void }) {
  return (
    <button
      type="button"
      className={`${ADMIN_SHEET_PHONE_HIDE_CLOSE_CLASS} shrink-0 rounded-full p-2 text-sage-500 transition-colors hover:bg-white/60 hover:text-sage-900`}
      aria-label={label}
      onClick={onClose}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
      </svg>
    </button>
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
  if (!isKnownGiftStatus(status)) {
    return status;
  }
  return t(`statusValues.${status}`);
}

function isKnownGiftStatus(status: string): status is GiftCardStatus {
  return (GIFT_CARD_STATUSES as readonly string[]).includes(status);
}
