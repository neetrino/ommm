"use client";

import { useCallback, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminDetailSheetTabBar } from "@/components/admin/admin-detail-sheet-tab-bar";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import type { UserGiftCardRow } from "@/components/account/user-gift-cards-types";
import { UserGiftCardSheetTabPanels } from "@/components/account/user-gift-card-sheet-tab-panels";
import {
  USER_GIFT_CARD_SHEET_TAB_ORDER,
  USER_GIFT_CARD_SHEET_TAB_OVERVIEW,
  type UserGiftCardSheetTabId,
} from "@/components/account/user-gift-card-sheet-tabs";
import {
  giftCardStatusBadgeClass,
} from "@/components/gift-cards/gift-card-display-helpers";
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

  return (
    <UserGiftCardDetailsSheetInner card={card} locale={locale} onClose={onClose} />
  );
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
  const [activeTab, setActiveTab] = useState<UserGiftCardSheetTabId>(
    USER_GIFT_CARD_SHEET_TAB_OVERVIEW,
  );

  const handleClose = useCallback(() => {
    setActiveTab(USER_GIFT_CARD_SHEET_TAB_OVERVIEW);
    onClose();
  }, [onClose]);

  const tabs = USER_GIFT_CARD_SHEET_TAB_ORDER.map((value) => ({
    value,
    label: t(`sheetTabs.${value}`),
  }));

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
          <span className={`shrink-0 ${giftCardStatusBadgeClass(card.status)}`}>
            {t(`statusValues.${card.status}`)}
          </span>
        </div>
      </header>

      <AdminDetailSheetTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(value) => setActiveTab(value as UserGiftCardSheetTabId)}
      />

      <div className={`${ADMIN_DETAILS_SHEET_BODY_CLASS} min-h-0 flex-1`}>
        <UserGiftCardSheetTabPanels activeTab={activeTab} card={card} locale={locale} />
      </div>
    </OmmDrawerPortal>
  );
}
