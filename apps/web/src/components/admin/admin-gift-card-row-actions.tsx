"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import type { AdminGiftCardBatchRow } from "@/components/admin/admin-gift-cards-types";
import {
  ADMIN_ACTION_ICON_CLASS,
  PencilGlyph,
  TrashGlyph,
} from "@/components/ui/admin-action-glyphs";
import { AnimatedToggleSwitch } from "@/components/ui/animated-toggle-switch";
import { AdminRowIconButton } from "@/components/ui/admin-row-icon-button";

const LIST_TOGGLE_BUTTON_CLASS = "ommm-admin-row-icon-button-toggle";

const BOARD_TOOLBAR_CLASS =
  "mt-auto flex flex-wrap items-center justify-center gap-1 pt-3";

const BOARD_TOGGLE_BUTTON_CLASS =
  "inline-flex shrink-0 cursor-pointer items-center rounded-full p-1 transition-opacity hover:opacity-85 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-40";

const BOARD_TEXT_ACTION_CLASS =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-medium text-sage-700 transition-colors hover:bg-sand-100/90 active:bg-sand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-40";

const BOARD_DELETE_ACTION_CLASS =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50/90 active:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-40";

type AdminGiftCardRowActionsProps = {
  variant?: "list" | "board";
  card: AdminGiftCardBatchRow;
  busyBatchId: string | null;
  onEdit: (batchId: string) => void;
  onDelete: (batchId: string) => void;
  onOpenActions: (card: AdminGiftCardBatchRow) => void;
  onChanged?: () => void;
  showOpenActionsLink?: boolean;
};

function isGiftCardStatusToggleable(status: AdminGiftCardBatchRow["status"]): boolean {
  return status === "ACTIVE" || status === "DEACTIVATED";
}

export function AdminGiftCardRowActions({
  variant = "list",
  card,
  busyBatchId,
  onEdit,
  onDelete,
  onOpenActions,
  onChanged,
  showOpenActionsLink = true,
}: AdminGiftCardRowActionsProps) {
  const t = useTranslations("adminPages.giftCards");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [pendingIsActive, setPendingIsActive] = useState<boolean | null>(null);
  const isActive = pendingIsActive ?? card.status === "ACTIVE";
  const canToggleStatus = isGiftCardStatusToggleable(card.status);
  const disabled = busyBatchId !== null || busy;
  const toggleLabel = isActive ? t("deactivateGiftCard") : t("activateGiftCard");

  async function toggleStatus(): Promise<void> {
    if (disabled || !canToggleStatus) {
      return;
    }

    const nextIsActive = !isActive;
    setPendingIsActive(nextIsActive);
    setBusy(true);

    try {
      await apiFetch(
        nextIsActive
          ? `/gift-cards/admin/batches/${card.id}/activate`
          : `/gift-cards/admin/batches/${card.id}/deactivate`,
        { method: "PATCH" },
      );
      onChanged?.();
      router.refresh();
    } catch {
      setPendingIsActive(null);
    } finally {
      setBusy(false);
      setPendingIsActive(null);
    }
  }

  function handleToggleClick(event: React.MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    void toggleStatus();
  }

  if (variant === "board") {
    return (
      <div
        className={BOARD_TOOLBAR_CLASS}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        role="toolbar"
        aria-label={t("colActions")}
      >
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
          className={BOARD_TEXT_ACTION_CLASS}
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            onEdit(card.id);
          }}
        >
          <PencilGlyph className="h-4 w-4 shrink-0" />
          {t("boardEditButton")}
        </button>
        <button
          type="button"
          className={BOARD_DELETE_ACTION_CLASS}
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            onDelete(card.id);
          }}
        >
          <TrashGlyph className="h-4 w-4 shrink-0" />
          {t("actions.delete")}
        </button>
      </div>
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
    <div
      className={`flex flex-wrap items-center gap-2 ${
        showOpenActionsLink ? "justify-center" : "justify-end"
      }`}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      role="group"
      aria-label={t("colActions")}
    >
      {showOpenActionsLink ? (
        <button
          type="button"
          className="text-sm text-sage-700 underline-offset-2 hover:underline"
          onClick={(event) => {
            event.stopPropagation();
            onOpenActions(card);
          }}
          disabled={disabled}
        >
          {t("openActions")}
        </button>
      ) : null}

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
      {listToggleControl}
      <AdminRowIconButton
        ariaLabel={t("actions.delete")}
        title={t("actions.delete")}
        variant="danger"
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          onDelete(card.id);
        }}
      >
        <TrashGlyph className={ADMIN_ACTION_ICON_CLASS} />
      </AdminRowIconButton>
    </div>
  );
}
