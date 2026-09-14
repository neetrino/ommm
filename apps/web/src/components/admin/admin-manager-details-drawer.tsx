"use client";

import { useCallback, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AdminDetailSheetFormFooter } from "@/components/admin/admin-detail-sheet-form-footer";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_LEDE_CLASS,
  ADMIN_DETAILS_SHEET_MEDIUM_PANEL_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import {
  managerAccessKind,
  managerDirectoryDisplayName,
} from "@/components/admin/admin-manager-display";
import {
  AdminManagerEditForm,
  type AdminManagerEditFormHandle,
} from "@/components/admin/admin-manager-edit-form";
import { AdminManagerRowActions } from "@/components/admin/admin-manager-row-actions";
import type { AdminManagerDirectoryRow } from "@/components/admin/admin-managers-types";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { DeleteActionButton } from "@/components/ui/delete-action-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { useAdminAnimatedSheetClose } from "@/components/admin/use-admin-animated-sheet-close";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateForUi } from "@/lib/date-display";

type AdminManagerDetailsDrawerProps = {
  manager: AdminManagerDirectoryRow | null;
  onClose: () => void;
  onUpdated?: (id: string, patch: AdminManagerDirectoryRow) => void;
  onSaveSuccess?: (message: string) => void;
};

export function AdminManagerDetailsDrawer({
  manager,
  onClose,
  onUpdated,
  onSaveSuccess,
}: AdminManagerDetailsDrawerProps) {
  if (manager === null) {
    return null;
  }
  return (
    <AdminManagerDetailsDrawerInner
      manager={manager}
      onClose={onClose}
      onUpdated={onUpdated}
      onSaveSuccess={onSaveSuccess}
    />
  );
}

function AdminManagerDetailsDrawerInner({
  manager,
  onClose,
  onUpdated,
  onSaveSuccess,
}: {
  manager: AdminManagerDirectoryRow;
  onClose: () => void;
  onUpdated?: (id: string, patch: AdminManagerDirectoryRow) => void;
  onSaveSuccess?: (message: string) => void;
}) {
  const t = useTranslations("adminPages.managers");
  const tDrawer = useTranslations("adminPages.managers.drawer");
  const titleId = useId();
  const router = useRouter();
  const { isOpen: sheetOpen, requestClose, onAfterClose } = useAdminAnimatedSheetClose(onClose);
  const editFormRef = useRef<AdminManagerEditFormHandle>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [notice, setNotice] = useState<{ message: string; tone: "ok" | "err" } | null>(null);
  const accessKind = managerAccessKind(manager);
  const accessLabel =
    accessKind === "blocked"
      ? t("statusBlocked")
      : accessKind === "invited"
        ? t("statusInvited")
        : t("statusActive");

  const handleSaved = useCallback(
    (patch: AdminManagerDirectoryRow) => {
      onUpdated?.(manager.id, patch);
      onSaveSuccess?.(t("updateSuccess"));
    },
    [manager.id, onSaveSuccess, onUpdated, t],
  );

  async function resendInvite(): Promise<void> {
    if (actionBusy || !manager.invitePending) {
      return;
    }
    setActionBusy(true);
    try {
      await apiFetch(`/managers/${manager.id}/resend-invite`, { method: "POST" });
      setNotice({ message: t("resendInviteSuccess"), tone: "ok" });
    } catch (error) {
      setNotice({
        message: error instanceof ApiError ? error.message : t("genericError"),
        tone: "err",
      });
    } finally {
      setActionBusy(false);
    }
  }

  async function confirmDelete(): Promise<void> {
    if (actionBusy || manager.isSelf) {
      return;
    }
    setActionBusy(true);
    try {
      await apiFetch(`/managers/${manager.id}`, { method: "DELETE" });
      setPendingDelete(false);
      onSaveSuccess?.(t("deleteSuccess"));
      requestClose();
      router.refresh();
    } catch (error) {
      setNotice({
        message: error instanceof ApiError ? error.message : t("genericError"),
        tone: "err",
      });
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <AdminSheetPortal presentation="drawer"
      isOpen={sheetOpen}
      onClose={requestClose}
      onAfterClose={onAfterClose}
      backdropAriaLabel={t("modalBackdropClose")}
      ariaLabelledBy={titleId}
      drawerOverlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      drawerPanelClassName={ADMIN_DETAILS_SHEET_MEDIUM_PANEL_CLASS}
      useOverlayPortalRoot
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={ADMIN_DETAILS_SHEET_LEDE_CLASS}>{tDrawer("eyebrow")}</p>
            <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
              {managerDirectoryDisplayName(manager)}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${
                accessKind === "blocked"
                  ? "bg-peach-100 text-sand-700"
                  : accessKind === "invited"
                    ? "bg-sand-100 text-sand-700"
                    : "bg-mint-100 text-sage-800"
              }`}
            >
              {accessLabel}
            </span>
            <div className="md:hidden">
              <AdminManagerRowActions
                manager={manager}
                onChanged={() => undefined}
                onPatched={(patch) => {
                  onUpdated?.(manager.id, { ...manager, ...patch });
                }}
              />
            </div>
            {manager.isSelf ? null : (
              <DeleteActionButton
                ariaLabel={t("deleteManager")}
                disabled={actionBusy}
                onClick={() => setPendingDelete(true)}
              />
            )}
            <button
              type="button"
              className={ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS}
              aria-label={tDrawer("close")}
              onClick={requestClose}
            >
              ×
            </button>
          </div>
        </div>
      </header>
      <div className={ADMIN_DETAILS_SHEET_BODY_CLASS}>
        <AdminManagerEditForm
          manager={manager}
          formRef={editFormRef}
          onSaved={handleSaved}
          onBusyChange={setBusy}
          onDirtyChange={setDirty}
        />
        <p className="mt-4 text-right text-sm text-sage-600">
          {tDrawer("joined")}: {formatDateForUi(manager.createdAt)}
        </p>
        {manager.invitePending ? (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="inline-flex cursor-pointer items-center justify-center rounded-full border border-amber-300/90 bg-amber-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-amber-950 shadow-sm transition-colors hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45"
              disabled={actionBusy}
              onClick={() => {
                void resendInvite();
              }}
            >
              {t("resendInvite")}
            </button>
          </div>
        ) : null}
      </div>
      <AdminDetailSheetFormFooter
        saveLabel={t("saveButton")}
        cancelLabel={t("cancelButton")}
        savingLabel={t("savingButton")}
        dirty={dirty}
        busy={busy}
        onSave={() => {
          void editFormRef.current?.save();
        }}
        onCancel={() => editFormRef.current?.reset()}
      />
      {notice ? (
        <AdminCenterToast
          message={notice.message}
          tone={notice.tone}
          onDismiss={() => setNotice(null)}
        />
      ) : null}
      <OmmConfirmDialog
        isOpen={pendingDelete}
        title={t("deleteManager")}
        description={t("deleteConfirm")}
        confirmLabel={actionBusy ? t("savingButton") : t("deleteManager")}
        cancelLabel={t("cancelButton")}
        backdropAriaLabel={t("modalBackdropClose")}
        tone="danger"
        confirmClassName="ommm-btn-lifecycle-action--danger"
        pending={actionBusy}
        onConfirm={() => {
          void confirmDelete();
        }}
        onCancel={() => {
          if (!actionBusy) {
            setPendingDelete(false);
          }
        }}
      />
    </AdminSheetPortal>
  );
}
