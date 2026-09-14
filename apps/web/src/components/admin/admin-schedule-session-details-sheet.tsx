"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminDetailSheetFormFooter } from "@/components/admin/admin-detail-sheet-form-footer";
import { AdminDetailSheetTabBar } from "@/components/admin/admin-detail-sheet-tab-bar";
import type {
  AdminScheduleCoach,
  AdminScheduleSession,
} from "@/components/admin/admin-schedule-management";
import { sessionEditFormFromRow } from "@/components/admin/admin-schedule-session-edit-form.types";
import { useSessionEditForm } from "@/components/admin/admin-schedule-session-edit-form.use";
import { buildCoachDropdownState } from "@/components/admin/admin-schedule-coach-filter";
import { coachName } from "@/components/admin/admin-schedule-session-display";
import { canDeleteAdminScheduleSession } from "@/components/admin/admin-schedule-session.helpers";
import { SessionSheetTabPanels } from "@/components/admin/admin-schedule-session-sheet-tab-panels";
import {
  SESSION_SHEET_TAB_BOOKINGS,
  SESSION_SHEET_TAB_ORDER,
  type SessionSheetTabId,
} from "@/components/admin/admin-schedule-session-sheet-tabs";
import { AdminScheduleSessionStatusAction } from "@/components/admin/admin-schedule-session-status-action";
import type { SessionClassTypeOption } from "@/components/admin/admin-schedule-session-class-type-resolve";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { CopyGlyph } from "@/components/ui/admin-action-glyphs";
import { DeleteActionButton } from "@/components/ui/delete-action-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { useAdminAnimatedSheetClose } from "@/components/admin/use-admin-animated-sheet-close";
import type { ScheduleCapabilities } from "@/lib/backoffice-capabilities";
import {
  adminBookingCapabilities,
  adminScheduleCapabilities,
} from "@/lib/backoffice-capabilities";

const DUPLICATE_ACTION_BUTTON_CLASS =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/70 text-sage-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-sage-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50";
const DUPLICATE_ICON_CLASS = "h-4 w-4 shrink-0";

type AdminScheduleSessionDetailsSheetProps = {
  locale: string;
  row: AdminScheduleSession | null;
  classTypeOptions: readonly SessionClassTypeOption[];
  coaches: readonly AdminScheduleCoach[];
  actionBusy: boolean;
  initialTab?: SessionSheetTabId;
  onClose: () => void;
  onSaved?: (row: AdminScheduleSession) => void;
  onDuplicate?: (row: AdminScheduleSession) => void;
  onDelete?: (row: AdminScheduleSession) => void;
  capabilities?: ScheduleCapabilities;
};

export function AdminScheduleSessionDetailsSheet({
  locale,
  row,
  classTypeOptions,
  coaches,
  actionBusy,
  onClose,
  onSaved,
  onDuplicate,
  onDelete,
  capabilities,
  initialTab = SESSION_SHEET_TAB_BOOKINGS,
}: AdminScheduleSessionDetailsSheetProps) {
  if (row === null) {
    return null;
  }

  const caps = capabilities ?? adminScheduleCapabilities();
  const canCancelBooking = adminBookingCapabilities().canCancel;

  return (
    <AdminScheduleSessionDetailsSheetInner
      locale={locale}
      row={row}
      classTypeOptions={classTypeOptions}
      coaches={coaches}
      actionBusy={actionBusy}
      onClose={onClose}
      onSaved={onSaved}
      onDuplicate={caps.canDuplicate ? onDuplicate : undefined}
      onDelete={caps.canDelete ? onDelete : undefined}
      canUpdate={caps.canUpdate}
      canCancelBooking={canCancelBooking}
      initialTab={initialTab}
    />
  );
}

function AdminScheduleSessionDetailsSheetInner({
  locale,
  row,
  classTypeOptions,
  coaches,
  actionBusy,
  onClose,
  onSaved,
  onDuplicate,
  onDelete,
  canUpdate = true,
  canCancelBooking = true,
  initialTab = SESSION_SHEET_TAB_BOOKINGS,
}: {
  locale: string;
  row: AdminScheduleSession;
  classTypeOptions: readonly SessionClassTypeOption[];
  coaches: readonly AdminScheduleCoach[];
  actionBusy: boolean;
  onClose: () => void;
  onSaved?: (row: AdminScheduleSession) => void;
  onDuplicate?: (row: AdminScheduleSession) => void;
  onDelete?: (row: AdminScheduleSession) => void;
  canUpdate?: boolean;
  canCancelBooking?: boolean;
  initialTab?: SessionSheetTabId;
  onClassTypeCreated?: (type: { id: string; name: string; slug: string }) => void;
}) {
  const t = useTranslations("adminPages.classes");
  const titleId = useId();
  const { isOpen: sheetOpen, requestClose, onAfterClose } = useAdminAnimatedSheetClose(onClose, {
    openKey: row.id,
  });
  const tabSyncKey = `${row.id}:${initialTab}`;
  const [activeTab, setActiveTab] = useState<SessionSheetTabId>(initialTab);
  const [prevTabSyncKey, setPrevTabSyncKey] = useState(tabSyncKey);
  if (tabSyncKey !== prevTabSyncKey) {
    setPrevTabSyncKey(tabSyncKey);
    setActiveTab(initialTab);
  }
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ message: string; tone: "ok" | "err" } | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] = useState(false);
  const canDelete = onDelete !== undefined && canDeleteAdminScheduleSession(row);

  const fallbackClassTypeId = classTypeOptions[0]?.value ?? "";
  const fallbackCoachId = coaches[0]?.id ?? "";

  const editInitial = useMemo(() => {
    const base = sessionEditFormFromRow(row, fallbackClassTypeId, fallbackCoachId);
    const coachDropdown = buildCoachDropdownState(
      coaches,
      base.classTypeId,
      classTypeOptions,
      base.coachId,
      coachName,
    );
    return { ...base, coachId: coachDropdown.coachId };
  }, [classTypeOptions, coaches, fallbackClassTypeId, fallbackCoachId, row]);

  const editForm = useSessionEditForm({
    sessionId: row.id,
    resetKey: `${row.id}:${row.startsAt}:${row.endsAt}:${row.status}:${row.capacity}`,
    initial: editInitial,
    classTypeOptions,
    coaches,
    onSaved: (saved) => {
      onSaved?.(saved);
    },
  });

  const sheetBusy = editForm.busy || statusBusy || actionBusy;
  const toastMessage = statusNotice?.message ?? editForm.message;
  const toastTone = statusNotice?.tone ?? editForm.messageTone;

  const tabs = SESSION_SHEET_TAB_ORDER.map((value) => ({
    value,
    label: t(`sheetTabs.${value}`),
  }));
  const isBookingsTab = activeTab === SESSION_SHEET_TAB_BOOKINGS;
  const bodyClassName = isBookingsTab
    ? "flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-5 sm:px-6"
    : `${ADMIN_DETAILS_SHEET_BODY_CLASS} min-h-0 flex-1`;

  const handleClose = useCallback(() => {
    if (sheetBusy) {
      return;
    }
    if (editForm.dirty) {
      return;
    }
    requestClose();
  }, [editForm.dirty, requestClose, sheetBusy]);

  function handleStatusChanged(updated: AdminScheduleSession): void {
    onSaved?.(updated);
  }

  function handleBookingCancelled(): void {
    const sessionAlreadyEnded = new Date(row.endsAt).getTime() <= Date.now();
    if (sessionAlreadyEnded) {
      return;
    }
    onSaved?.({
      ...row,
      _count: {
        ...row._count,
        bookings: Math.max(0, row._count.bookings - 1),
      },
    });
  }

  return (
    <AdminSheetPortal presentation="drawer"
      isOpen={sheetOpen}
      onClose={handleClose}
      onAfterClose={onAfterClose}
      closeDisabled={sheetBusy || editForm.dirty}
      backdropAriaLabel={t("modalBackdropClose")}
      ariaLabelledBy={titleId}
      drawerOverlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      drawerPanelClassName={ADMIN_WIDE_DRAWER_PANEL_CLASS}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={titleId} className={`min-w-0 ${ADMIN_DETAILS_SHEET_TITLE_CLASS}`}>
              {row.title}
            </h2>
            <p className="mt-1 truncate text-sm text-sage-600">{row.classType.name}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <AdminScheduleSessionStatusAction
              sessionId={row.id}
              status={row.status}
              disabled={sheetBusy || !canUpdate}
              onChanged={handleStatusChanged}
              onBusyChange={setStatusBusy}
              onStatusMessage={(message, tone) => setStatusNotice({ message, tone })}
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
            {canDelete ? (
              <DeleteActionButton
                ariaLabel={t("actions.delete")}
                disabled={sheetBusy}
                onClick={() => setPendingDelete(true)}
              />
            ) : null}
            <button
              type="button"
              className={ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS}
              aria-label={t("modalCloseAria")}
              onClick={handleClose}
              disabled={sheetBusy || editForm.dirty}
            >
              ×
            </button>
          </div>
        </div>
      </header>

      <AdminDetailSheetTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(value) => setActiveTab(value as SessionSheetTabId)}
      />

      <div className={bodyClassName}>
        {toastMessage ? (
          <AdminCenterToast
            message={toastMessage}
            tone={toastTone}
            onDismiss={() => {
              editForm.clearMessage();
              setStatusNotice(null);
            }}
          />
        ) : null}
        <SessionSheetTabPanels
          activeTab={activeTab}
          locale={locale}
          row={row}
          classTypeOptions={classTypeOptions}
          coaches={coaches}
          controller={editForm}
          canCancelBooking={canCancelBooking}
          onBookingCancelled={handleBookingCancelled}
          onNotice={(message, tone) => setStatusNotice({ message, tone })}
        />
      </div>

      {canUpdate ? (
        <AdminDetailSheetFormFooter
          saveLabel={t("saveButton")}
          cancelLabel={t("cancelButton")}
          savingLabel={t("savingButton")}
          dirty={editForm.dirty}
          busy={editForm.busy}
          onCancel={editForm.cancelEdits}
          onSave={() => {
            void editForm.save(
              t("messages.updateSuccess"),
              t("messages.genericError"),
              t("validation.coachNotAssigned"),
            );
          }}
        />
      ) : null}
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
    </AdminSheetPortal>
  );
}
