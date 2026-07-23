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
import { SessionSheetTabPanels } from "@/components/admin/admin-schedule-session-sheet-tab-panels";
import {
  SESSION_SHEET_TAB_DETAILS,
  SESSION_SHEET_TAB_ORDER,
  type SessionSheetTabId,
} from "@/components/admin/admin-schedule-session-sheet-tabs";
import { AdminScheduleSessionStatusAction } from "@/components/admin/admin-schedule-session-status-action";
import type { SessionClassTypeOption } from "@/components/admin/admin-schedule-session-class-type-resolve";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import type { ScheduleCapabilities } from "@/lib/backoffice-capabilities";
import { adminScheduleCapabilities } from "@/lib/backoffice-capabilities";

type AdminScheduleSessionDetailsSheetProps = {
  locale: string;
  row: AdminScheduleSession | null;
  classTypeOptions: readonly SessionClassTypeOption[];
  coaches: readonly AdminScheduleCoach[];
  actionBusy: boolean;
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
}: AdminScheduleSessionDetailsSheetProps) {
  if (row === null) {
    return null;
  }

  const caps = capabilities ?? adminScheduleCapabilities();

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
  onClassTypeCreated?: (type: { id: string; name: string; slug: string }) => void;
}) {
  const t = useTranslations("adminPages.classes");
  const titleId = useId();
  const [activeTab, setActiveTab] = useState<SessionSheetTabId>(SESSION_SHEET_TAB_DETAILS);
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ message: string; tone: "ok" | "err" } | null>(
    null,
  );

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

  const handleClose = useCallback(() => {
    if (sheetBusy) {
      return;
    }
    if (editForm.dirty) {
      return;
    }
    onClose();
  }, [editForm.dirty, onClose, sheetBusy]);

  function handleStatusChanged(updated: AdminScheduleSession): void {
    onSaved?.(updated);
  }

  return (
    <OmmDrawerPortal
      isOpen
      onClose={handleClose}
      closeDisabled={sheetBusy || editForm.dirty}
      backdropAriaLabel={t("modalBackdropClose")}
      ariaLabelledBy={titleId}
      overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      panelClassName={ADMIN_WIDE_DRAWER_PANEL_CLASS}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={titleId} className={`min-w-0 ${ADMIN_DETAILS_SHEET_TITLE_CLASS}`}>
              {row.title}
            </h2>
            <p className="mt-1 truncate text-sm text-sage-600">{row.classType.name}</p>
          </div>
          <AdminScheduleSessionStatusAction
            sessionId={row.id}
            status={row.status}
            disabled={sheetBusy || !canUpdate}
            onChanged={handleStatusChanged}
            onBusyChange={setStatusBusy}
            onStatusMessage={(message, tone) => setStatusNotice({ message, tone })}
          />
        </div>
      </header>

      <AdminDetailSheetTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(value) => setActiveTab(value as SessionSheetTabId)}
      />

      <div className={`${ADMIN_DETAILS_SHEET_BODY_CLASS} min-h-0 flex-1`}>
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
          actionBusy={sheetBusy}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
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
    </OmmDrawerPortal>
  );
}
