"use client";

import { useTranslations } from "next-intl";
import {
  displayGiftCardDate,
  giftCardQuantityLabel,
} from "@/components/admin/admin-gift-card-display-helpers";
import { AdminGiftCardRowActions } from "@/components/admin/admin-gift-card-row-actions";
import { recipientLabel } from "@/components/admin/admin-gift-cards-filter-logic";
import type { AdminGiftCardBatchRow } from "@/components/admin/admin-gift-cards-types";
import { GiftCardBoardTile } from "@/components/gift-cards/gift-card-board-tile";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminGiftCardBoardCardProps = {
  card: AdminGiftCardBatchRow;
  locale: string;
  onSelect: (card: AdminGiftCardBatchRow) => void;
  onEdit: (batchId: string) => void;
  onChanged?: () => void;
  readOnly?: boolean;
};

export function AdminGiftCardBoardCard({
  card,
  locale,
  onSelect,
  onEdit,
  onChanged,
  readOnly = false,
}: AdminGiftCardBoardCardProps) {
  const t = useTranslations("adminPages.giftCards");

  return (
    <GiftCardBoardTile
      amountLabel={formatAmdFromCents(card.amountAmd, locale)}
      status={card.status}
      statusLabel={t(`statusValues.${card.status}`)}
      imageUrl={card.imageUrl}
      imageAlt={t("cardImageAlt")}
      imageFallbackLabel={t("cardImageFallback")}
      openAriaLabel={t("openCardAria", {
        amount: formatAmdFromCents(card.amountAmd, locale),
      })}
      onOpen={() => onSelect(card)}
      details={[
        { label: t("colCreated"), value: displayGiftCardDate(card.createdAt) },
        { label: t("colExpiration"), value: displayGiftCardDate(card.expiresAt) },
        { label: t("colRecipient"), value: recipientLabel(card) || "—" },
        { label: t("colAvailableQuantity"), value: giftCardQuantityLabel(card) },
      ]}
      footerAriaLabel={readOnly ? undefined : t("colActions")}
      footerActions={
        readOnly ? undefined : (
          <AdminGiftCardRowActions
            variant="board"
            card={card}
            onEdit={onEdit}
            onChanged={onChanged}
          />
        )
      }
    />
  );
}
