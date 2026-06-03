"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api";
import type { AdminGiftCardBatchRow } from "@/components/admin/admin-gift-cards-types";
import { PencilGlyph, TrashGlyph } from "@/components/ui/admin-action-glyphs";
import { AnimatedToggleSwitch } from "@/components/ui/animated-toggle-switch";
import { AdminRowIconButton, AdminRowIconGroup } from "@/components/ui/admin-row-icon-button";

const ROW_ICON_CLASS = "h-5 w-5 shrink-0";
const ROW_ICON_BUTTON_CLASS = "ommm-admin-row-icon-button-lg";
const ROW_TOGGLE_BUTTON_CLASS =
  "ommm-admin-row-icon-button-lg ommm-admin-row-icon-button-toggle";

type AdminGiftCardRowActionsProps = {
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

  return (
    <div
      className={`flex flex-wrap items-center gap-3 ${
        showOpenActionsLink ? "justify-center" : "justify-end"
      }`}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      role="presentation"
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

      <AdminRowIconGroup size="lg">
        <AdminRowIconButton
          ariaLabel={t("editTitle")}
          title={t("editTitle")}
          className={ROW_ICON_BUTTON_CLASS}
          onClick={(event) => {
            event.stopPropagation();
            onEdit(card.id);
          }}
          disabled={disabled}
        >
          <PencilGlyph className={ROW_ICON_CLASS} />
        </AdminRowIconButton>
        {canToggleStatus ? (
          <AdminRowIconButton
            ariaLabel={toggleLabel}
            title={toggleLabel}
            className={ROW_TOGGLE_BUTTON_CLASS}
            onClick={(event) => {
              event.stopPropagation();
              void toggleStatus();
            }}
            disabled={disabled}
          >
            <AnimatedToggleSwitch checked={isActive} />
          </AdminRowIconButton>
        ) : null}
        <AdminRowIconButton
          ariaLabel={t("actions.delete")}
          title={t("actions.delete")}
          variant="danger"
          className={ROW_ICON_BUTTON_CLASS}
          onClick={(event) => {
            event.stopPropagation();
            onDelete(card.id);
          }}
          disabled={disabled}
        >
          <TrashGlyph className={ROW_ICON_CLASS} />
        </AdminRowIconButton>
      </AdminRowIconGroup>
    </div>
  );
}
