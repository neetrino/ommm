"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import {
  giftCardActionErrorMessage,
  resolveGiftCardConfirmCopy,
  type GiftCardPendingConfirm,
} from "@/components/admin/admin-gift-card-row-action-copy";
import type { AdminGiftCardBatchRow } from "@/components/admin/admin-gift-cards-types";
import {
  ADMIN_ACTION_ICON_CLASS,
  PencilGlyph,
  TrashGlyph,
} from "@/components/ui/admin-action-glyphs";
import { AnimatedToggleSwitch } from "@/components/ui/animated-toggle-switch";
import { AdminRowIconButton } from "@/components/ui/admin-row-icon-button";
import { DeleteActionButton } from "@/components/ui/delete-action-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import {
  GIFT_CARD_BOARD_TEXT_ACTION_CLASS,
} from "@/components/gift-cards/gift-card-board-tile";

const LIST_TOGGLE_BUTTON_CLASS = "ommm-admin-row-icon-button-toggle";

const BOARD_TOGGLE_BUTTON_CLASS =
  "inline-flex shrink-0 cursor-pointer items-center rounded-full p-1 transition-opacity hover:opacity-85 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-40";

type AdminGiftCardRowActionsProps = {
  variant?: "list" | "board";
  card: AdminGiftCardBatchRow;
  canDelete?: boolean;
  onEdit: (batchId: string) => void;
  onChanged?: () => void;
};

const BOARD_DELETE_BUTTON_CLASS = `${GIFT_CARD_BOARD_TEXT_ACTION_CLASS} text-red-700 hover:bg-red-50`;

function isGiftCardStatusToggleable(status: AdminGiftCardBatchRow["status"]): boolean {
  return status === "ACTIVE" || status === "DEACTIVATED";
}

export function AdminGiftCardRowActions({
  variant = "list",
  card,
  canDelete = false,
  onEdit,
  onChanged,
}: AdminGiftCardRowActionsProps) {
  const t = useTranslations("adminPages.giftCards");
  const tActions = useTranslations("adminPages.giftCards.actions");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [pendingIsActive, setPendingIsActive] = useState<boolean | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<GiftCardPendingConfirm | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const isActive = pendingIsActive ?? card.status === "ACTIVE";
  const canToggleStatus = isGiftCardStatusToggleable(card.status);
  const disabled = busy;
  const toggleLabel = isActive ? t("deactivateGiftCard") : t("activateGiftCard");

  function openConfirm(): void {
    if (disabled || !canToggleStatus) {
      return;
    }
    setActionError(null);
    setPendingConfirm(isActive ? "deactivate" : "activate");
  }

  function openDelete(event: React.MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    if (disabled || !canDelete) {
      return;
    }
    setActionError(null);
    setPendingConfirm("delete");
  }

  function closeConfirm(): void {
    if (busy) {
      return;
    }
    setActionError(null);
    setPendingConfirm(null);
  }

  async function confirmStatusChange(): Promise<void> {
    if (busy || pendingConfirm === null) {
      return;
    }

    const nextIsActive = pendingConfirm === "activate";
    if (pendingConfirm !== "delete") {
      setPendingIsActive(nextIsActive);
    }
    setBusy(true);
    setActionError(null);

    try {
      if (pendingConfirm === "delete") {
        await apiFetch(`/gift-cards/admin/batches/${card.id}`, { method: "DELETE" });
      } else {
        await apiFetch(
          nextIsActive
            ? `/gift-cards/admin/batches/${card.id}/activate`
            : `/gift-cards/admin/batches/${card.id}/deactivate`,
          { method: "PATCH" },
        );
      }
      setPendingConfirm(null);
      onChanged?.();
      router.refresh();
    } catch (error) {
      setPendingIsActive(null);
      setActionError(
        giftCardActionErrorMessage(
          error,
          tActions("failed"),
          tActions("deleteIssuedBlocked"),
        ),
      );
    } finally {
      setBusy(false);
      setPendingIsActive(null);
    }
  }

  function handleToggleClick(event: React.MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    openConfirm();
  }

  const confirmCopy = resolveGiftCardConfirmCopy(pendingConfirm, t, tActions);
  const confirmLabel = busy
    ? pendingConfirm === "delete"
      ? tActions("deleting")
      : t("savingButton")
    : confirmCopy.confirmLabel;
  const confirmError = actionError ? (
    <p className="text-sm text-red-800" role="alert">
      {actionError}
    </p>
  ) : null;

  if (variant === "board") {
    return (
      <>
        {canToggleStatus ? (
          <button
            type="button"
            className={BOARD_TOGGLE_BUTTON_CLASS}
            aria-label={toggleLabel}
            title={toggleLabel}
            disabled={disabled}
            onClick={handleToggleClick}
          >
            <AnimatedToggleSwitch checked={isActive} className="ommm-toggle-switch-board" />
          </button>
        ) : null}
        <button
          type="button"
          className={GIFT_CARD_BOARD_TEXT_ACTION_CLASS}
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            onEdit(card.id);
          }}
        >
          <PencilGlyph className="h-4 w-4 shrink-0" />
          {t("boardEditButton")}
        </button>
        {canDelete ? (
          <button
            type="button"
            className={BOARD_DELETE_BUTTON_CLASS}
            disabled={disabled}
            onClick={openDelete}
          >
            <TrashGlyph className="h-4 w-4 shrink-0" />
            {tActions("delete")}
          </button>
        ) : null}

        <OmmConfirmDialog
          isOpen={pendingConfirm !== null}
          title={confirmCopy.title}
          description={confirmCopy.description}
          confirmLabel={confirmLabel}
          cancelLabel={t("cancelButton")}
          backdropAriaLabel={t("modalBackdropClose")}
          tone={confirmCopy.tone}
          confirmClassName={confirmCopy.confirmClassName}
          pending={busy}
          onConfirm={() => {
            void confirmStatusChange();
          }}
          onCancel={closeConfirm}
        >
          {confirmError}
        </OmmConfirmDialog>
      </>
    );
  }

  const listToggleControl = canToggleStatus ? (
    <AdminRowIconButton
      ariaLabel={toggleLabel}
      title={toggleLabel}
      className={LIST_TOGGLE_BUTTON_CLASS}
      disabled={disabled}
      onClick={handleToggleClick}
    >
      <AnimatedToggleSwitch checked={isActive} />
    </AdminRowIconButton>
  ) : null;

  return (
    <>
      <div
        className="flex flex-wrap items-center justify-end gap-2"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        role="group"
        aria-label={t("colActions")}
      >
        <AdminRowIconButton
          ariaLabel={t("editTitle")}
          title={t("editTitle")}
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            onEdit(card.id);
          }}
        >
          <PencilGlyph className={ADMIN_ACTION_ICON_CLASS} />
        </AdminRowIconButton>
        {canDelete ? (
          <DeleteActionButton
            ariaLabel={tActions("delete")}
            disabled={disabled}
            onClick={openDelete}
          />
        ) : null}
        {listToggleControl}
      </div>

      <OmmConfirmDialog
        isOpen={pendingConfirm !== null}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={confirmLabel}
        cancelLabel={t("cancelButton")}
        backdropAriaLabel={t("modalBackdropClose")}
        tone={confirmCopy.tone}
        confirmClassName={confirmCopy.confirmClassName}
        pending={busy}
        onConfirm={() => {
          void confirmStatusChange();
        }}
        onCancel={closeConfirm}
      >
        {confirmError}
      </OmmConfirmDialog>
    </>
  );
}
