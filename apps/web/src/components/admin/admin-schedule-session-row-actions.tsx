"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ADMIN_ACTION_ICON_CLASS,
  BanGlyph,
  CheckCircleGlyph,
  CopyGlyph,
  TrashGlyph,
} from "@/components/ui/admin-action-glyphs";
import { AdminRowIconButton } from "@/components/ui/admin-row-icon-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";

type SessionStatus = "ACTIVE" | "CANCELLED" | "FULL" | "DRAFT";

type SessionRowRef = {
  id: string;
  status: SessionStatus;
};

type PendingConfirmKind = "cancel" | "activate" | "delete";

type AdminScheduleSessionRowActionsProps<TRow extends SessionRowRef> = {
  row: TRow;
  busy: boolean;
  includeDelete?: boolean;
  onDuplicate?: (row: TRow) => void;
  onCancel?: (row: TRow) => void;
  onActivate?: (row: TRow) => void;
  onDelete?: (row: TRow) => void;
};

export function AdminScheduleSessionRowActions<TRow extends SessionRowRef>({
  row,
  busy,
  includeDelete = false,
  onDuplicate,
  onCancel,
  onActivate,
  onDelete,
}: AdminScheduleSessionRowActionsProps<TRow>) {
  const t = useTranslations("adminPages.classes");
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirmKind | null>(null);
  const isCancelled = row.status === "CANCELLED";

  function openConfirm(kind: PendingConfirmKind): void {
    if (busy) {
      return;
    }
    setPendingConfirm(kind);
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
      onCancel?.(row);
    } else if (pendingConfirm === "activate") {
      onActivate?.(row);
    } else if (onDelete) {
      onDelete(row);
    }
    setPendingConfirm(null);
  }

  const confirmCopy =
    pendingConfirm === "delete"
      ? {
          title: t("confirmDeleteTitle"),
          description: t("deleteConfirm"),
          confirmLabel: t("confirmDialogDelete"),
          tone: "danger" as const,
          confirmClassName: "ommm-btn-lifecycle-action--danger",
        }
      : pendingConfirm === "activate"
        ? {
            title: t("confirm.activateTitle"),
            description: t("confirm.activateDescription"),
            confirmLabel: t("activateAction"),
            tone: "success" as const,
            confirmClassName: "ommm-btn-lifecycle-action--success",
          }
        : {
            title: t("confirm.cancelTitle"),
            description: t("confirm.cancelDescription"),
            confirmLabel: t("cancelAction"),
            tone: "warm" as const,
            confirmClassName: "ommm-btn-lifecycle-action--warm",
          };

  return (
    <>
      <div
        className="flex items-center justify-end gap-2"
        role="group"
        aria-label={t("colActions")}
      >
        {onDuplicate ? (
          <AdminRowIconButton
            ariaLabel={t("duplicateButton")}
            title={t("duplicateButton")}
            variant="subtle"
            onClick={(event) => {
              event.stopPropagation();
              onDuplicate(row);
            }}
            disabled={busy}
          >
            <CopyGlyph className={ADMIN_ACTION_ICON_CLASS} />
          </AdminRowIconButton>
        ) : null}
        {isCancelled ? (
          onActivate ? (
            <AdminRowIconButton
              ariaLabel={t("activateAction")}
              title={t("activateAction")}
              onClick={(event) => {
                event.stopPropagation();
                openConfirm("activate");
              }}
              disabled={busy}
            >
              <CheckCircleGlyph className={ADMIN_ACTION_ICON_CLASS} />
            </AdminRowIconButton>
          ) : null
        ) : onCancel ? (
          <AdminRowIconButton
            ariaLabel={t("cancelAction")}
            title={t("cancelAction")}
            variant="warning"
            onClick={(event) => {
              event.stopPropagation();
              openConfirm("cancel");
            }}
            disabled={busy}
          >
            <BanGlyph className={ADMIN_ACTION_ICON_CLASS} />
          </AdminRowIconButton>
        ) : null}
        {includeDelete && onDelete ? (
          <AdminRowIconButton
            ariaLabel={t("actions.delete")}
            title={t("actions.delete")}
            variant="danger"
            onClick={(event) => {
              event.stopPropagation();
              openConfirm("delete");
            }}
            disabled={busy}
          >
            <TrashGlyph className={ADMIN_ACTION_ICON_CLASS} />
          </AdminRowIconButton>
        ) : null}
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
