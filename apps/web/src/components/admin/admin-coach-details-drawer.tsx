"use client";

import { useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminCoachStatusAction } from "@/components/admin/admin-coach-status-action";
import { AdminDetailSheetFormFooter } from "@/components/admin/admin-detail-sheet-form-footer";
import { AdminDetailSheetTabBar } from "@/components/admin/admin-detail-sheet-tab-bar";
import {
  COACH_MAX_AGE,
  COACH_MIN_AGE,
  type CoachClassOption,
} from "@/components/admin/admin-coach-form-helpers";
import { useCoachEditForm } from "@/components/admin/admin-coach-edit-form.use";
import type { CoachEditInitialValues } from "@/components/admin/admin-coach-edit-form.types";
import {
  COACH_SHEET_TAB_ORDER,
  COACH_SHEET_TAB_PROFILE,
  type CoachSheetTabId,
} from "@/components/admin/admin-coach-sheet-tabs";
import { CoachSheetTabPanels } from "@/components/admin/admin-coach-sheet-tab-panels";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import type { AdminCoachDirectoryRow } from "@/components/admin/admin-coaches-types";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { coachCardInitials } from "@/components/coaches/coach-card-display";

type AdminCoachDetailsDrawerProps = {
  coach: AdminCoachDirectoryRow | null;
  locale: string;
  classOptions: readonly CoachClassOption[];
  onClose: () => void;
};

export function AdminCoachDetailsDrawer({
  coach,
  locale,
  classOptions,
  onClose,
}: AdminCoachDetailsDrawerProps) {
  if (coach === null) {
    return null;
  }

  return (
    <AdminCoachDetailsDrawerInner
      coach={coach}
      locale={locale}
      classOptions={classOptions}
      onClose={onClose}
    />
  );
}

function coachInitialValues(coach: AdminCoachDirectoryRow): CoachEditInitialValues {
  return {
    email: coach.user.email,
    name: coach.user.name ?? "",
    lastName: coach.user.lastName ?? "",
    phone: coach.user.phone ?? "",
    age: coach.age,
    birthday: coach.user.dateOfBirth,
    photoUrl: coach.user.avatarUrl,
    bio: coach.bio ?? "",
    experienceYears: coach.experienceYears,
    assignedClassTypeIds: coach.assignedClassTypeIds,
    schedule: coach.schedule,
    specialization: coach.specialization ?? "",
  };
}

function AdminCoachDetailsDrawerInner({
  coach,
  locale,
  classOptions,
  onClose,
}: {
  coach: AdminCoachDirectoryRow;
  locale: string;
  classOptions: readonly CoachClassOption[];
  onClose: () => void;
}) {
  const t = useTranslations("adminPages.coaches");
  const titleId = useId();
  const [activeTab, setActiveTab] = useState<CoachSheetTabId>(COACH_SHEET_TAB_PROFILE);
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ message: string; tone: "ok" | "err" } | null>(
    null,
  );
  const initial = useMemo(() => coachInitialValues(coach), [coach]);

  const validationLabels = useMemo(
    () => ({
      emailRequired: t("emailRequired"),
      emailInvalid: t("emailInvalid"),
      nameRequired: t("nameRequired"),
      lastNameRequired: t("lastNameRequired"),
      phoneRequired: t("phoneRequired"),
      phoneInvalid: t("phoneInvalid"),
      ageInvalid: t("ageInvalid", { min: COACH_MIN_AGE, max: COACH_MAX_AGE }),
      birthdayInvalid: t("birthdayInvalid"),
      ageBirthdayMismatch: t("ageBirthdayMismatch"),
      bioTooLong: t("bioTooLong"),
      experienceInvalid: t("experienceInvalid"),
      specializationTooLong: t("specializationTooLong"),
      assignedClassesInvalid: t("assignedClassesInvalid"),
      photoTooLarge: t("photoTooLarge"),
      scheduleInvalid: t("scheduleInvalid"),
    }),
    [t],
  );

  const editForm = useCoachEditForm({
    coachId: coach.id,
    resetKey: `${coach.id}:${coach.updatedAt}`,
    initial,
    classOptions,
    labels: validationLabels,
  });

  const headerName = useMemo(() => {
    const fullName = [coach.user.name, coach.user.lastName].filter(Boolean).join(" ").trim();
    return fullName.length > 0 ? fullName : "—";
  }, [coach.user.lastName, coach.user.name]);
  const tabs = COACH_SHEET_TAB_ORDER.map((value) => ({
    value,
    label: t(`sheetTabs.${value}`),
  }));

  function handleClose(): void {
    if (editForm.busy || statusBusy) {
      return;
    }
    onClose();
  }

  const statusLabels = useMemo(
    () => ({
      activate: t("activateCoach"),
      deactivate: t("deactivateCoach"),
      saving: t("savingButton"),
      confirmActivate: t("confirmActivate"),
      confirmDeactivate: t("confirmDeactivate"),
      activated: t("activateSuccess"),
      deactivated: t("deactivateSuccess"),
      failed: t("genericError"),
    }),
    [t],
  );

  const sheetBusy = editForm.busy || statusBusy;
  const toastMessage = editForm.message ?? statusNotice?.message ?? null;
  const toastTone = editForm.message ? editForm.messageTone : statusNotice?.tone ?? "ok";

  return (
    <OmmDrawerPortal
      isOpen
      onClose={handleClose}
      closeDisabled={sheetBusy}
      backdropAriaLabel={t("drawer.close")}
      ariaLabelledBy={titleId}
      overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      panelClassName={ADMIN_WIDE_DRAWER_PANEL_CLASS}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className={`min-w-0 ${ADMIN_DETAILS_SHEET_TITLE_CLASS}`}>
            {headerName}
          </h2>
          <div className="flex shrink-0 items-center">
            <AdminCoachStatusAction
              coachId={coach.id}
              isActive={coach.isActive}
              labels={statusLabels}
              layout="inline"
              disabled={editForm.busy}
              onBusyChange={setStatusBusy}
              onStatusMessage={(message, tone) => setStatusNotice({ message, tone })}
              onChanged={onClose}
            />
          </div>
        </div>
      </header>

      <AdminDetailSheetTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(value) => setActiveTab(value as CoachSheetTabId)}
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

        <CoachSheetTabPanels
          activeTab={activeTab}
          coachId={coach.id}
          locale={locale}
          classOptions={classOptions}
          form={editForm.form}
          errors={editForm.errors}
          busy={editForm.busy}
          photoPreviewUrl={editForm.photoPreviewUrl}
          controller={editForm}
          overview={{
            isActive: coach.isActive,
            createdAt: coach.createdAt,
            totalClasses: coach.totalClasses,
            substituteClasses: coach.substituteClasses,
            assignedClassesCount: coach.assignedClassTypeIds.length,
            availabilitySlotsCount: coach.schedule.length,
            initials: coachCardInitials(coach.user),
          }}
        />
      </div>

      <AdminDetailSheetFormFooter
        saveLabel={t("saveButton")}
        cancelLabel={t("cancelButton")}
        savingLabel={t("savingButton")}
        dirty={editForm.dirty}
        busy={editForm.busy}
        onCancel={editForm.cancelEdits}
        onSave={() => {
          void editForm.save(t("updateSuccess"), t("genericError"));
        }}
      />
    </OmmDrawerPortal>
  );
}
