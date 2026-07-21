"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminDetailSheetTabBar } from "@/components/admin/admin-detail-sheet-tab-bar";
import { AdminGiftCardStatusAction } from "@/components/admin/admin-gift-card-status-action";
import { GiftCardSheetTabPanels } from "@/components/admin/admin-gift-card-sheet-tab-panels";
import {
  GIFT_CARD_SHEET_TAB_ACTIONS,
  GIFT_CARD_SHEET_TAB_ORDER,
  GIFT_CARD_SHEET_TAB_OVERVIEW,
  type GiftCardSheetTabId,
} from "@/components/admin/admin-gift-card-sheet-tabs";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import type {
  AdminAssignableUser,
  AdminGiftCardBatchRow,
} from "@/components/admin/admin-gift-cards-types";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { GiftCardCapabilities } from "@/lib/backoffice-capabilities";
import { adminGiftCardCapabilities } from "@/lib/backoffice-capabilities";

type AdminGiftCardDetailsSheetProps = {
  card: AdminGiftCardBatchRow | null;
  locale: string;
  assignableUsers: readonly AdminAssignableUser[];
  onClose: () => void;
  onChanged: () => void;
  /** @deprecated Prefer `capabilities`. */
  readOnly?: boolean;
  capabilities?: GiftCardCapabilities;
};

function isGiftCardStatusToggleable(status: AdminGiftCardBatchRow["status"]): boolean {
  return status === "ACTIVE" || status === "DEACTIVATED";
}

export function AdminGiftCardDetailsSheet({
  card,
  locale,
  assignableUsers,
  onClose,
  onChanged,
  readOnly = false,
  capabilities,
}: AdminGiftCardDetailsSheetProps) {
  if (card === null) {
    return null;
  }

  const caps =
    capabilities ??
    (readOnly
      ? {
          ...adminGiftCardCapabilities(),
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canAssign: false,
          canActivate: false,
          canDeactivate: false,
          canResend: false,
        }
      : adminGiftCardCapabilities());

  return (
    <AdminGiftCardDetailsSheetInner
      card={card}
      locale={locale}
      assignableUsers={assignableUsers}
      readOnly={!caps.canUpdate}
      capabilities={caps}
      onClose={onClose}
      onChanged={onChanged}
    />
  );
}

function AdminGiftCardDetailsSheetInner({
  card,
  locale,
  assignableUsers,
  onClose,
  onChanged,
  readOnly = false,
  capabilities,
}: {
  card: AdminGiftCardBatchRow;
  locale: string;
  assignableUsers: readonly AdminAssignableUser[];
  onClose: () => void;
  onChanged: () => void;
  readOnly?: boolean;
  capabilities: GiftCardCapabilities;
}) {
  const t = useTranslations("adminPages.giftCards");
  const tActions = useTranslations("adminPages.giftCards.actions");
  const titleId = useId();
  const [activeTab, setActiveTab] = useState<GiftCardSheetTabId>(GIFT_CARD_SHEET_TAB_OVERVIEW);
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ message: string; tone: "ok" | "err" } | null>(
    null,
  );

  const resetSheet = useCallback(() => {
    setActiveTab(GIFT_CARD_SHEET_TAB_OVERVIEW);
    setStatusNotice(null);
  }, []);

  const handleClose = useCallback(() => {
    if (statusBusy) {
      return;
    }
    resetSheet();
    onClose();
  }, [onClose, resetSheet, statusBusy]);

  const handleRemoved = useCallback(() => {
    resetSheet();
    onClose();
    onChanged();
  }, [onChanged, onClose, resetSheet]);

  const tabs = GIFT_CARD_SHEET_TAB_ORDER.filter(
    (value) => !readOnly || value !== GIFT_CARD_SHEET_TAB_ACTIONS,
  ).map((value) => ({
    value,
    label: t(`sheetTabs.${value}`),
  }));

  const statusLabels = useMemo(
    () => ({
      activate: t("activateGiftCard"),
      deactivate: t("deactivateGiftCard"),
      saving: t("savingButton"),
      confirmActivate: t("confirmActivate"),
      confirmDeactivate: tActions("deactivateConfirm"),
      activated: tActions("activated"),
      deactivated: tActions("deactivated"),
      failed: tActions("failed"),
    }),
    [t, tActions],
  );

  const amountLabel = formatAmdFromCents(card.amountAmd, locale);
  const isActive = card.status === "ACTIVE";
  const canToggleStatus =
    !readOnly &&
    isGiftCardStatusToggleable(card.status) &&
    ((isActive && capabilities.canDeactivate) || (!isActive && capabilities.canActivate));

  return (
    <OmmDrawerPortal
      isOpen
      onClose={handleClose}
      closeDisabled={statusBusy}
      backdropAriaLabel={t("modalBackdropClose")}
      ariaLabelledBy={titleId}
      overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      panelClassName={ADMIN_WIDE_DRAWER_PANEL_CLASS}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className={`min-w-0 ${ADMIN_DETAILS_SHEET_TITLE_CLASS}`}>
            {amountLabel}
          </h2>
          {canToggleStatus ? (
            <AdminGiftCardStatusAction
              batchId={card.id}
              isActive={isActive}
              canToggle={canToggleStatus}
              labels={statusLabels}
              layout="inline"
              onBusyChange={setStatusBusy}
              onStatusMessage={(message, tone) => setStatusNotice({ message, tone })}
              onChanged={onChanged}
            />
          ) : null}
        </div>
      </header>

      <AdminDetailSheetTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(value) => setActiveTab(value as GiftCardSheetTabId)}
      />

      <div className={`${ADMIN_DETAILS_SHEET_BODY_CLASS} min-h-0 flex-1`}>
        {statusNotice ? (
          <AdminCenterToast
            message={statusNotice.message}
            tone={statusNotice.tone}
            onDismiss={() => setStatusNotice(null)}
          />
        ) : null}

        <GiftCardSheetTabPanels
          activeTab={activeTab}
          card={card}
          locale={locale}
          assignableUsers={assignableUsers}
          readOnly={readOnly}
          canDelete={capabilities.canDelete}
          canAssign={capabilities.canAssign}
          onChanged={onChanged}
          onRemoved={handleRemoved}
        />
      </div>
    </OmmDrawerPortal>
  );
}
