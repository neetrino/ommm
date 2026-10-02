"use client";

import { useTranslations } from "next-intl";
import {
  displayGiftCardDate,
  giftCardQuantityLabel,
} from "@/components/admin/admin-gift-card-display-helpers";
import { AdminGiftCardRowActions } from "@/components/admin/admin-gift-card-row-actions";
import type { AdminGiftCardBatchRow } from "@/components/admin/admin-gift-cards-types";
import { useGiftCardValueLabel } from "@/components/admin/admin-gift-card-value";
import { GiftCardBoardTile } from "@/components/gift-cards/gift-card-board-tile";

type AdminGiftCardBoardCardProps = {
  card: AdminGiftCardBatchRow;
  locale: string;
  onSelect: (card: AdminGiftCardBatchRow) => void;
  onEdit: (batchId: string) => void;
  onChanged?: () => void;
  canDelete?: boolean;
  readOnly?: boolean;
};

export function AdminGiftCardBoardCard({
  card,
  locale,
  onSelect,
  onEdit,
  onChanged,
  canDelete = false,
  readOnly = false,
}: AdminGiftCardBoardCardProps) {
  const t = useTranslations("adminPages.giftCards");
  const valueLabel = useGiftCardValueLabel(card, locale);

  return (
    <GiftCardBoardTile
      amountLabel={valueLabel}
      status={card.status}
      statusLabel={t(`statusValues.${card.status}`)}
      imageAlt={t("cardImageAlt")}
      openAriaLabel={t("openCardAria", { amount: valueLabel })}
      onOpen={() => onSelect(card)}
      details={[
        { label: t("colCreated"), value: displayGiftCardDate(card.createdAt) },
        { label: t("colExpiration"), value: displayGiftCardDate(card.expiresAt) },
        { label: t("colAvailableQuantity"), value: giftCardQuantityLabel(card) },
      ]}
      footerAriaLabel={readOnly ? undefined : t("colActions")}
      footerActions={
        readOnly ? undefined : (
          <AdminGiftCardRowActions
            variant="board"
            card={card}
            canDelete={canDelete}
            onEdit={onEdit}
            onChanged={onChanged}
          />
        )
      }
    />
  );
}
