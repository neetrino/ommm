"use client";

import { useCallback, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AdminDetailSheetFormFooter } from "@/components/admin/admin-detail-sheet-form-footer";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_BLOCK_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_LEDE_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import {
  managerAccessKind,
  managerDirectoryDisplayName,
} from "@/components/admin/admin-manager-display";
import {
  AdminManagerEditForm,
  type AdminManagerEditFormHandle,
} from "@/components/admin/admin-manager-edit-form";
import type { AdminManagerDirectoryRow } from "@/components/admin/admin-managers-types";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
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
      onClose();
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
      isOpen
      onClose={onClose}
      backdropAriaLabel={t("modalBackdropClose")}
      ariaLabelledBy={titleId}
      drawerOverlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      drawerPanelClassName={ADMIN_WIDE_DRAWER_PANEL_CLASS}
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
          <button
            type="button"
            className={ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS}
            aria-label={tDrawer("close")}
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </header>
      <div className={ADMIN_DETAILS_SHEET_BODY_CLASS}>
        <dl className={`${ADMIN_DETAILS_SHEET_DETAIL_BLOCK_CLASS} mb-5 grid gap-3 sm:grid-cols-2`}>
          <div>
            <dt className={ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS}>{tDrawer("access")}</dt>
            <dd className={ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS}>{accessLabel}</dd>
          </div>
          <div>
            <dt className={ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS}>{tDrawer("joined")}</dt>
            <dd className={ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS}>
              {formatDateForUi(manager.createdAt)}
            </dd>
          </div>
        </dl>
        <AdminManagerEditForm
          manager={manager}
          formRef={editFormRef}
          onSaved={handleSaved}
          onBusyChange={setBusy}
          onDirtyChange={setDirty}
        />
        <div className="mt-6 flex flex-wrap gap-3">
          {manager.invitePending ? (
            <OmmButton
              type="button"
              variant="secondary"
              size="sm"
              disabled={actionBusy}
              onClick={() => {
                void resendInvite();
              }}
            >
              {t("resendInvite")}
            </OmmButton>
          ) : null}
          {manager.isSelf ? null : (
            <OmmButton
              type="button"
              variant="danger"
              size="sm"
              disabled={actionBusy}
              onClick={() => setPendingDelete(true)}
            >
              {t("deleteManager")}
            </OmmButton>
          )}
        </div>
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
