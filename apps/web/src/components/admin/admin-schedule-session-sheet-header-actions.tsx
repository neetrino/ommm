"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { AdminScheduleSession } from "@/components/admin/admin-schedule-management";
import { AdminScheduleSessionStatusAction } from "@/components/admin/admin-schedule-session-status-action";
import { SessionSheetMobileActionsMenu } from "@/components/admin/admin-schedule-session-sheet-mobile-actions-menu";
import { ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS } from "@/components/admin/admin-details-sheet-layout";
import { CopyGlyph } from "@/components/ui/admin-action-glyphs";
import { DeleteActionButton } from "@/components/ui/delete-action-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";

const DUPLICATE_ACTION_BUTTON_CLASS =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/70 text-sage-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-sage-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50";

const DUPLICATE_ICON_CLASS = "h-4 w-4 shrink-0";

type AdminScheduleSessionSheetHeaderActionsProps = {
  row: AdminScheduleSession;
  sheetBusy: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  closeDisabled: boolean;
  onClose: () => void;
  onDuplicate?: (row: AdminScheduleSession) => void;
  onDelete?: (row: AdminScheduleSession) => void;
  onStatusChanged: (row: AdminScheduleSession) => void;
  onBusyChange: (busy: boolean) => void;
  onStatusMessage: (message: string, tone: "ok" | "err") => void;
};

export function AdminScheduleSessionSheetHeaderActions({
  row,
  sheetBusy,
  canUpdate,
  canDelete,
  closeDisabled,
  onClose,
  onDuplicate,
  onDelete,
  onStatusChanged,
  onBusyChange,
  onStatusMessage,
}: AdminScheduleSessionSheetHeaderActionsProps) {
  const t = useTranslations("adminPages.classes");
  const [pendingDelete, setPendingDelete] = useState(false);
  const canToggleLifecycle = canUpdate && row.status !== "FINISHED";
  const hasMenuActions =
    onDuplicate !== undefined || canToggleLifecycle || (canDelete && onDelete !== undefined);

  return (
    <>
      <div className="hidden shrink-0 items-center gap-2 md:flex">
        <AdminScheduleSessionStatusAction
          sessionId={row.id}
          status={row.status}
          disabled={sheetBusy || !canUpdate}
          onChanged={onStatusChanged}
          onBusyChange={onBusyChange}
          onStatusMessage={onStatusMessage}
        />
        {onDuplicate ? (
          <button
            type="button"
            className={DUPLICATE_ACTION_BUTTON_CLASS}
            aria-label={t("duplicateButton")}
            title={t("duplicateButton")}
            disabled={sheetBusy}
            onClick={() => onDuplicate(row)}
          >
            <CopyGlyph className={DUPLICATE_ICON_CLASS} />
          </button>
        ) : null}
        {canDelete && onDelete ? (
          <DeleteActionButton
            ariaLabel={t("actions.delete")}
            disabled={sheetBusy}
            onClick={() => setPendingDelete(true)}
          />
        ) : null}
      </div>

      {hasMenuActions ? (
        <div className="md:hidden">
          <SessionSheetMobileActionsMenu
            row={row}
            disabled={sheetBusy}
            canToggleLifecycle={canToggleLifecycle}
            canDelete={canDelete}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onStatusChanged={onStatusChanged}
            onBusyChange={onBusyChange}
            onStatusMessage={onStatusMessage}
          />
        </div>
      ) : null}

      <button
        type="button"
        className={ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS}
        aria-label={t("modalCloseAria")}
        onClick={onClose}
        disabled={closeDisabled}
      >
        ×
      </button>

      {canDelete && onDelete ? (
        <OmmConfirmDialog
          isOpen={pendingDelete}
          title={t("confirmDeleteTitle")}
          description={t("deleteConfirm")}
          confirmLabel={sheetBusy ? t("savingButton") : t("confirmDialogDelete")}
          cancelLabel={t("confirmDialogNo")}
          backdropAriaLabel={t("confirmDialogBackdrop")}
          tone="danger"
          confirmClassName="ommm-btn-lifecycle-action--danger"
          pending={sheetBusy}
          onConfirm={() => {
            onDelete(row);
            setPendingDelete(false);
          }}
          onCancel={() => {
            if (!sheetBusy) {
              setPendingDelete(false);
            }
          }}
        />
      ) : null}
    </>
  );
}
