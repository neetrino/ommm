"use client";

import { useTranslations } from "next-intl";
import { AdminGiftCardBoardCard } from "@/components/admin/admin-gift-card-board-card";
import { AdminGiftCardCompactRow } from "@/components/admin/admin-gift-card-compact-row";
import {
  ADMIN_GIFT_CARDS_LIST_ACTIONS_HEADER_CELL,
  ADMIN_GIFT_CARDS_LIST_EMPHASIZED_HEADER,
  ADMIN_GIFT_CARDS_LIST_HEADER_CLASS,
  ADMIN_GIFT_CARDS_LIST_TABLE_CLASS,
} from "@/components/admin/admin-gift-cards-list-layout";
import { useAdminGiftCardsView } from "@/components/admin/admin-gift-cards-view-context";
import type { AdminGiftCardBatchRow } from "@/components/admin/admin-gift-cards-types";
import { useEffectiveListBoardViewMode } from "@/hooks/use-effective-list-board-view-mode";

type AdminGiftCardsDirectoryProps = {
  cards: readonly AdminGiftCardBatchRow[];
  locale: string;
  onSelect: (card: AdminGiftCardBatchRow) => void;
  onEdit: (batchId: string) => void;
  onChanged?: () => void;
};

function AdminGiftCardsBoardView(props: AdminGiftCardsDirectoryProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {props.cards.map((card) => (
        <AdminGiftCardBoardCard key={card.id} card={card} {...props} />
      ))}
    </div>
  );
}

function AdminGiftCardsListView({
  cards,
  locale,
  onSelect,
  onEdit,
  onChanged,
}: AdminGiftCardsDirectoryProps) {
  const t = useTranslations("adminPages.giftCards");

  return (
    <div className={ADMIN_GIFT_CARDS_LIST_TABLE_CLASS}>
      <div className={ADMIN_GIFT_CARDS_LIST_HEADER_CLASS}>
        <span>{t("colImage")}</span>
        <span className={`${ADMIN_GIFT_CARDS_LIST_EMPHASIZED_HEADER} md:text-center`}>
          {t("colAmount")}
        </span>
        <span className={`${ADMIN_GIFT_CARDS_LIST_EMPHASIZED_HEADER} md:text-center`}>
          {t("colStatus")}
        </span>
        <span className={`${ADMIN_GIFT_CARDS_LIST_EMPHASIZED_HEADER} md:text-center`}>
          {t("colCreated")}
        </span>
        <span className={`${ADMIN_GIFT_CARDS_LIST_EMPHASIZED_HEADER} md:text-center`}>
          {t("colExpiration")}
        </span>
        <span className={`${ADMIN_GIFT_CARDS_LIST_EMPHASIZED_HEADER} md:text-center`}>
          {t("colAvailableQuantity")}
        </span>
        <span aria-hidden="true" />
        <span className={ADMIN_GIFT_CARDS_LIST_ACTIONS_HEADER_CELL}>{t("colActions")}</span>
      </div>
      {cards.map((card) => (
        <AdminGiftCardCompactRow
          key={card.id}
          card={card}
          locale={locale}
          onSelect={onSelect}
          onEdit={onEdit}
          onChanged={onChanged}
        />
      ))}
    </div>
  );
}

export function AdminGiftCardsDirectory(props: AdminGiftCardsDirectoryProps) {
  const { viewMode: preferredViewMode } = useAdminGiftCardsView();
  const viewMode = useEffectiveListBoardViewMode(preferredViewMode);

  if (viewMode === "board") {
    return <AdminGiftCardsBoardView {...props} />;
  }

  return <AdminGiftCardsListView {...props} />;
}
