"use client";

import { useTranslations } from "next-intl";
import {
  displayGiftCardDate,
  giftCardQuantityLabel,
  giftCardStatusBadgeClass,
} from "@/components/admin/admin-gift-card-display-helpers";
import { AdminGiftCardRowActions } from "@/components/admin/admin-gift-card-row-actions";
import {
  ADMIN_GIFT_CARDS_LIST_ACTIONS_CELL,
  ADMIN_GIFT_CARDS_LIST_CELL,
  ADMIN_GIFT_CARDS_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_GIFT_CARDS_LIST_ROW_CLASS,
  ADMIN_GIFT_CARDS_LIST_SPACER_CELL,
  ADMIN_GIFT_CARDS_LIST_STATUS_CELL,
} from "@/components/admin/admin-gift-cards-list-layout";
import type { AdminGiftCardBatchRow } from "@/components/admin/admin-gift-cards-types";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { useGiftCardValueLabel } from "@/components/admin/admin-gift-card-value";
import { GiftCardFace } from "@/components/gift-cards/gift-card-face";

type AdminGiftCardCompactRowProps = {
  card: AdminGiftCardBatchRow;
  locale: string;
  onSelect: (card: AdminGiftCardBatchRow) => void;
  onEdit: (batchId: string) => void;
  onChanged?: () => void;
  canDelete?: boolean;
  readOnly?: boolean;
};

export function AdminGiftCardCompactRow({
  card,
  locale,
  onSelect,
  onEdit,
  onChanged,
  canDelete = false,
  readOnly = false,
}: AdminGiftCardCompactRowProps) {
  const t = useTranslations("adminPages.giftCards");
  const valueLabel = useGiftCardValueLabel(card, locale);

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={t("openCardAria", { amount: valueLabel })}
      onClick={() => onSelect(card)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(card);
        }
      }}
      className={ADMIN_GIFT_CARDS_LIST_ROW_CLASS}
    >
      <div className={ADMIN_GIFT_CARDS_LIST_CELL}>
        <AdminListMobileLabel label={t("colImage")} />
        <div className="h-14 w-20 overflow-hidden rounded-xl border border-white/60 bg-sage-100">
          <GiftCardFace alt={t("cardImageAlt")} className="h-full w-full" />
        </div>
      </div>

      <div className={`${ADMIN_GIFT_CARDS_LIST_CELL} md:text-center`}>
        <AdminListMobileLabel label={t("colAmount")} />
        <p className="truncate text-sm font-semibold text-sage-900" title={valueLabel}>
          {valueLabel}
        </p>
      </div>

      <div className={ADMIN_GIFT_CARDS_LIST_STATUS_CELL}>
        <AdminListMobileLabel label={t("colStatus")} />
        <span className={giftCardStatusBadgeClass(card.status)}>
          {t(`statusValues.${card.status}`)}
        </span>
      </div>

      <div className={`${ADMIN_GIFT_CARDS_LIST_CELL} md:text-center`}>
        <AdminListMobileLabel label={t("colCreated")} />
        <p className="text-sm text-sage-800">{displayGiftCardDate(card.createdAt)}</p>
      </div>

      <div className={`${ADMIN_GIFT_CARDS_LIST_CELL} md:text-center`}>
        <AdminListMobileLabel label={t("colExpiration")} />
        <p className="text-sm text-sage-800">{displayGiftCardDate(card.expiresAt)}</p>
      </div>

      <div className={`${ADMIN_GIFT_CARDS_LIST_CELL} md:text-center`}>
        <AdminListMobileLabel label={t("colAvailableQuantity")} />
        <p className="text-sm text-sage-800">{giftCardQuantityLabel(card)}</p>
      </div>

      {readOnly ? null : (
        <>
          <div className={ADMIN_GIFT_CARDS_LIST_SPACER_CELL} aria-hidden="true" />

          <div
            className={`${ADMIN_GIFT_CARDS_LIST_ACTIONS_CELL} ${ADMIN_GIFT_CARDS_LIST_ROW_ACTIONS_HOVER_REVEAL}`}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <AdminListMobileLabel label={t("colActions")} />
            <AdminGiftCardRowActions
              card={card}
              canDelete={canDelete}
              onEdit={onEdit}
              onChanged={onChanged}
            />
          </div>
        </>
      )}
    </article>
  );
}
