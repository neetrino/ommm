"use client";

import { useCallback, useId } from "react";
import { useTranslations } from "next-intl";
import { UserGiftCardCopyCodeButton } from "@/components/account/user-gift-card-copy-code-button";
import { UserGiftCardSheetContent } from "@/components/account/user-gift-card-sheet-content";
import type { UserGiftCardRow } from "@/components/account/user-gift-cards-types";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { giftCardStatusBadgeClass } from "@/components/gift-cards/gift-card-display-helpers";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { formatAmdFromCents } from "@/lib/price-amd";

type UserGiftCardDetailsSheetProps = {
  card: UserGiftCardRow | null;
  locale: string;
  onClose: () => void;
};

export function UserGiftCardDetailsSheet({
  card,
  locale,
  onClose,
}: UserGiftCardDetailsSheetProps) {
  if (card === null) {
    return null;
  }

  return <UserGiftCardDetailsSheetInner card={card} locale={locale} onClose={onClose} />;
}

function UserGiftCardDetailsSheetInner({
  card,
  locale,
  onClose,
}: {
  card: UserGiftCardRow;
  locale: string;
  onClose: () => void;
}) {
  const t = useTranslations("userPages.giftCards");
  const titleId = useId();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const amountLabel = formatAmdFromCents(card.amountCents, locale);

  return (
    <OmmDrawerPortal
      isOpen
      onClose={handleClose}
      backdropAriaLabel={t("sheetBackdropClose")}
      ariaLabelledBy={titleId}
      overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      panelClassName={ADMIN_WIDE_DRAWER_PANEL_CLASS}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className={`min-w-0 ${ADMIN_DETAILS_SHEET_TITLE_CLASS}`}>
            {amountLabel}
          </h2>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <UserGiftCardCopyCodeButton code={card.code} />
            <span className={giftCardStatusBadgeClass(card.status)}>
              {t(`statusValues.${card.status}`)}
            </span>
          </div>
        </div>
      </header>

      <div className={`${ADMIN_DETAILS_SHEET_BODY_CLASS} min-h-0 flex-1`}>
        <UserGiftCardSheetContent card={card} locale={locale} />
      </div>
    </OmmDrawerPortal>
  );
}
