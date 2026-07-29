"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";

type BulkConfirmKind = "cancel" | "activate";

type AdminScheduleSessionsBulkBarProps = {
  selectedCount: number;
  cancellableCount: number;
  activatableCount: number;
  busy: boolean;
  onBulkCancel?: () => void;
  onBulkActivate?: () => void;
};

/** Sticky toolbar for multi-selected schedule sessions. */
export function AdminScheduleSessionsBulkBar({
  selectedCount,
  cancellableCount,
  activatableCount,
  busy,
  onBulkCancel,
  onBulkActivate,
}: AdminScheduleSessionsBulkBarProps) {
  const t = useTranslations("adminPages.classes");
  const [pendingConfirm, setPendingConfirm] = useState<BulkConfirmKind | null>(null);

  if (selectedCount === 0) {
    return null;
  }

  function closeConfirm(): void {
    if (busy) {
      return;
    }
    setPendingConfirm(null);
  }

  function confirmAction(): void {
    if (pendingConfirm === null || busy) {
      return;
    }
    if (pendingConfirm === "cancel") {
      onBulkCancel?.();
    } else {
      onBulkActivate?.();
    }
    setPendingConfirm(null);
  }

  const confirmCopy =
    pendingConfirm === "activate"
      ? {
          title: t("bulk.confirmActivateTitle"),
          description: t("bulk.confirmActivateDescription", { count: activatableCount }),
          confirmLabel: t("bulk.activateSelected"),
          tone: "success" as const,
          confirmClassName: "ommm-btn-lifecycle-action--success",
        }
      : {
          title: t("bulk.confirmCancelTitle"),
          description: t("bulk.confirmCancelDescription", { count: cancellableCount }),
          confirmLabel: t("bulk.cancelSelected"),
          tone: "warm" as const,
          confirmClassName: "ommm-btn-lifecycle-action--warm",
        };

  return (
    <>
      <div
        className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sand-200/80 bg-white/95 px-4 py-3 shadow-[0_16px_40px_-24px_rgba(45,40,35,0.45)] backdrop-blur-md"
        role="region"
        aria-label={t("bulk.regionAria")}
      >
        <p className="text-sm font-medium text-sage-800">
          {t("bulk.selectedCount", { count: selectedCount })}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {onBulkCancel && cancellableCount > 0 ? (
            <OmmButton
              type="button"
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => setPendingConfirm("cancel")}
            >
              {t("bulk.cancelSelected")}
            </OmmButton>
          ) : null}
          {onBulkActivate && activatableCount > 0 ? (
            <OmmButton
              type="button"
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => setPendingConfirm("activate")}
            >
              {t("bulk.activateSelected")}
            </OmmButton>
          ) : null}
        </div>
      </div>

      <OmmConfirmDialog
        isOpen={pendingConfirm !== null}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={confirmCopy.confirmLabel}
        cancelLabel={t("confirmDialogNo")}
        backdropAriaLabel={t("confirmDialogBackdrop")}
        tone={confirmCopy.tone}
        confirmClassName={confirmCopy.confirmClassName}
        pending={busy}
        onConfirm={confirmAction}
        onCancel={closeConfirm}
      />
    </>
  );
}
