"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminDetailSheetFormFooter } from "@/components/admin/admin-detail-sheet-form-footer";
import { AdminDetailSheetTabBar } from "@/components/admin/admin-detail-sheet-tab-bar";
import {
  COACH_MAX_AGE,
  COACH_MIN_AGE,
  type CoachClassOption,
} from "@/components/admin/admin-coach-form-helpers";
import type { CoachEditInitialValues } from "@/components/admin/admin-coach-edit-form.types";
import { useCoachEditForm } from "@/components/admin/admin-coach-edit-form.use";
import {
  COACH_SHEET_TAB_CLASSES,
  COACH_SHEET_TAB_DETAILS,
  COACH_SHEET_TAB_PROFILE,
  COACH_SHEET_TAB_SCHEDULE,
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
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { EditActionButton } from "@/components/ui/edit-action-button";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";

export const EDIT_COACH_QUERY_KEY = "editCoach";

const MANAGER_EDIT_TABS: readonly CoachSheetTabId[] = [
  COACH_SHEET_TAB_PROFILE,
  COACH_SHEET_TAB_DETAILS,
  COACH_SHEET_TAB_CLASSES,
  COACH_SHEET_TAB_SCHEDULE,
];

type AdminCoachActionsProps = {
  coachId: string;
  showEditTrigger?: boolean;
  locale?: string;
  classTypeOptions?: readonly string[];
  classOptions?: readonly CoachClassOption[];
  initialEmail?: string;
  initialName?: string;
  initialLastName?: string;
  initialPhone?: string;
  initialAge?: number | null;
  initialBirthday?: string | null;
  initialPhotoUrl?: string | null;
  initialExperienceYears?: number | null;
  initialAssignedClassTypeIds?: readonly string[];
  initialSchedule?: readonly { id: string; date: string; time: string; spots: number }[];
  initialSpecialization?: string;
  initialClassType?: string;
  initialBio?: string;
};

export function AdminCoachActions({
  coachId,
  showEditTrigger = true,
  locale = "en",
  classTypeOptions = [],
  classOptions = [],
  initialEmail = "",
  initialName = "",
  initialLastName = "",
  initialPhone = "",
  initialAge = null,
  initialBirthday = null,
  initialPhotoUrl = null,
  initialExperienceYears = null,
  initialAssignedClassTypeIds = [],
  initialSchedule = [],
  initialSpecialization = "",
  initialClassType = "",
  initialBio = "",
}: AdminCoachActionsProps) {
  const t = useTranslations("adminPages.coaches");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const titleId = useId();
  const isOpen = searchParams.get(EDIT_COACH_QUERY_KEY) === coachId;
  const [activeTab, setActiveTab] = useState<CoachSheetTabId>(COACH_SHEET_TAB_PROFILE);

  const initial = useMemo<CoachEditInitialValues>(
    () => ({
      email: initialEmail,
      name: initialName,
      lastName: initialLastName,
      phone: initialPhone,
      age: initialAge,
      birthday: initialBirthday,
      photoUrl: initialPhotoUrl,
      bio: initialBio,
      experienceYears: initialExperienceYears,
      assignedClassTypeIds: initialAssignedClassTypeIds,
      schedule: initialSchedule,
      specialization: initialSpecialization,
      classType: initialClassType,
    }),
    [
      initialAge,
      initialAssignedClassTypeIds,
      initialBio,
      initialBirthday,
      initialClassType,
      initialEmail,
      initialExperienceYears,
      initialLastName,
      initialName,
      initialPhone,
      initialPhotoUrl,
      initialSchedule,
      initialSpecialization,
    ],
  );

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
      classTypeInvalid: t("classTypeInvalid"),
      assignedClassesInvalid: t("assignedClassesInvalid"),
      photoTooLarge: t("photoTooLarge"),
      scheduleInvalid: t("scheduleInvalid"),
    }),
    [t],
  );

  const tabs = MANAGER_EDIT_TABS.map((value) => ({
    value,
    label: t(`sheetTabs.${value}`),
  }));

  const closeSheet = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(EDIT_COACH_QUERY_KEY);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [pathname, router, searchParams]);

  const editForm = useCoachEditForm({
    coachId,
    resetKey: isOpen ? `${coachId}:open` : `${coachId}:closed`,
    initial,
    classTypeOptions,
    classOptions,
    labels: validationLabels,
    onSaved: closeSheet,
  });

  function openSheet(): void {
    const params = new URLSearchParams(searchParams.toString());
    params.set(EDIT_COACH_QUERY_KEY, coachId);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  function handleClose(): void {
    if (editForm.busy) {
      return;
    }
    closeSheet();
    editForm.clearMessage();
  }

  return (
    <>
      {showEditTrigger ? (
        <div className="flex items-center justify-center">
          <EditActionButton
            ariaLabel={t("editCoach")}
            title={t("editCoach")}
            onClick={openSheet}
          />
        </div>
      ) : null}

      <OmmDrawerPortal
        isOpen={isOpen}
        onClose={handleClose}
        closeDisabled={editForm.busy}
        backdropAriaLabel={t("modalBackdropClose")}
        ariaLabelledBy={titleId}
        overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
        panelClassName={ADMIN_WIDE_DRAWER_PANEL_CLASS}
      >
        <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
          <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
            {t("editModalTitle")}
          </h2>
          <p className="ommm-body-muted mt-1 text-sm">{t("editModalDescription")}</p>
        </header>

        <AdminDetailSheetTabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(value) => setActiveTab(value as CoachSheetTabId)}
        />

        <div className={`${ADMIN_DETAILS_SHEET_BODY_CLASS} min-h-0 flex-1`}>
          {editForm.message ? (
            <AdminCenterToast
              message={editForm.message}
              tone={editForm.messageTone}
              onDismiss={editForm.clearMessage}
            />
          ) : null}
          <CoachSheetTabPanels
            activeTab={activeTab}
            coachId={coachId}
            locale={locale}
            classTypeOptions={classTypeOptions}
            classOptions={classOptions}
            form={editForm.form}
            errors={editForm.errors}
            busy={editForm.busy}
            photoPreviewUrl={editForm.photoPreviewUrl}
            controller={editForm}
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
    </>
  );
}
