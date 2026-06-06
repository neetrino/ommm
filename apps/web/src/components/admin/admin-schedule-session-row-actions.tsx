"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ADMIN_SCHEDULE_STATUS_BADGE_CLASS,
  sessionStatusBadgeTone,
} from "@/components/admin/admin-schedule-session-list-badges";
import {
  ADMIN_ACTION_ICON_CLASS,
  CancelGlyph,
  CheckCircleGlyph,
  CopyGlyph,
  PencilGlyph,
  TrashGlyph,
} from "@/components/ui/admin-action-glyphs";
import { AdminRowIconButton } from "@/components/ui/admin-row-icon-button";
import { OmmButton } from "@/components/ui/omm-button";
import { AdminConfirmSheet } from "@/components/admin/admin-confirm-sheet";

type SessionStatus = "ACTIVE" | "CANCELLED" | "FULL" | "DRAFT";

type SessionRowRef = {
  id: string;
  status: SessionStatus;
};

type PendingConfirmKind = "cancel" | "activate" | "delete";

type AdminScheduleSessionRowActionsProps<TRow extends SessionRowRef> = {
  variant?: "list" | "sheet";
  row: TRow;
  busy: boolean;
  includeDelete?: boolean;
  onEdit?: (row: TRow) => void;
  onDuplicate?: (row: TRow) => void;
  onCancel: (row: TRow) => void;
  onActivate: (row: TRow) => void;
  onDelete?: (row: TRow) => void;
};

export function AdminScheduleSessionRowActions<TRow extends SessionRowRef>({
  variant = "list",
  row,
  busy,
  includeDelete = false,
  onEdit,
  onDuplicate,
  onCancel,
  onActivate,
  onDelete,
}: AdminScheduleSessionRowActionsProps<TRow>) {
  const t = useTranslations("adminPages.classes");
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirmKind | null>(null);
  const isCancelled = row.status === "CANCELLED";
  const statusLabel = t(`status.${row.status}`);

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
      onCancel(row);
    } else if (pendingConfirm === "activate") {
      onActivate(row);
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
            tone: "danger" as const,
            confirmClassName: "ommm-btn-lifecycle-action--danger",
          };

  if (variant === "list") {
    return (
      <>
        <div
          className="flex items-center justify-end gap-2"
          role="group"
          aria-label={t("colActions")}
        >
          <span
            className={`${ADMIN_SCHEDULE_STATUS_BADGE_CLASS} ${sessionStatusBadgeTone(row.status)}`}
          >
            {statusLabel}
          </span>
          {onEdit ? (
            <AdminRowIconButton
              ariaLabel={t("editButton")}
              title={t("editButton")}
              onClick={(event) => {
                event.stopPropagation();
                onEdit(row);
              }}
              disabled={busy}
            >
              <PencilGlyph className={ADMIN_ACTION_ICON_CLASS} />
            </AdminRowIconButton>
          ) : null}
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
          ) : (
            <AdminRowIconButton
              ariaLabel={t("cancelAction")}
              title={t("cancelAction")}
              variant="danger"
              onClick={(event) => {
                event.stopPropagation();
                openConfirm("cancel");
              }}
              disabled={busy}
            >
              <CancelGlyph className={ADMIN_ACTION_ICON_CLASS} />
            </AdminRowIconButton>
          )}
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

        <AdminConfirmSheet
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

  return (
    <>
      <div className="flex w-full flex-wrap items-center justify-end gap-2">
        {onEdit ? (
          <OmmButton
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => onEdit(row)}
          >
            {t("editButton")}
          </OmmButton>
        ) : null}
        {onDuplicate ? (
          <OmmButton
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => onDuplicate(row)}
          >
            {t("duplicateButton")}
          </OmmButton>
        ) : null}
        {isCancelled ? (
          <OmmButton
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => openConfirm("activate")}
          >
            {t("activateAction")}
          </OmmButton>
        ) : (
          <OmmButton
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => openConfirm("cancel")}
          >
            {t("cancelAction")}
          </OmmButton>
        )}
        {includeDelete && onDelete ? (
          <OmmButton
            type="button"
            size="sm"
            variant="danger"
            disabled={busy}
            onClick={() => openConfirm("delete")}
          >
            {t("actions.delete")}
          </OmmButton>
        ) : null}
      </div>

      <AdminConfirmSheet
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
