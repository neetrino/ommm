"use client";

import { useId, useMemo, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { AdminCoachStatusAction } from "@/components/admin/admin-coach-status-action";
import { AdminDetailSheetFormFooter } from "@/components/admin/admin-detail-sheet-form-footer";
import { AdminDetailSheetTabBar } from "@/components/admin/admin-detail-sheet-tab-bar";
import {
  COACH_MAX_AGE,
  COACH_MIN_AGE,
  type CoachClassOption,
} from "@/components/admin/admin-coach-form-helpers";
import { useCoachEditForm, type CoachSavedSnapshot } from "@/components/admin/admin-coach-edit-form.use";
import type { CoachEditInitialValues } from "@/components/admin/admin-coach-edit-form.types";
import {
  COACH_PROFILE_TAB_QUERY_KEY,
  COACH_SHEET_TAB_ORDER,
  COACH_SHEET_TAB_PROFILE,
  parseCoachSheetTabId,
  type CoachSheetTabId,
} from "@/components/admin/admin-coach-sheet-tabs";
import { CoachSheetTabPanels } from "@/components/admin/admin-coach-sheet-tab-panels";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import type { AdminCoachDirectoryRow } from "@/components/admin/admin-coaches-types";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { coachCardInitials } from "@/components/coaches/coach-card-display";
import { usePathname, useRouter } from "@/i18n/navigation";

type AdminCoachDetailsDrawerProps = {
  coach: AdminCoachDirectoryRow | null;
  locale: string;
  classOptions: readonly CoachClassOption[];
  onClose: () => void;
  onCoachUpdated?: (coachId: string, patch: CoachSavedSnapshot) => void;
  onSaveSuccess?: (message: string) => void;
};

export function AdminCoachDetailsDrawer({
  coach,
  locale,
  classOptions,
  onClose,
  onCoachUpdated,
  onSaveSuccess,
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
      onCoachUpdated={onCoachUpdated}
      onSaveSuccess={onSaveSuccess}
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
  onCoachUpdated,
  onSaveSuccess,
}: {
  coach: AdminCoachDirectoryRow;
  locale: string;
  classOptions: readonly CoachClassOption[];
  onClose: () => void;
  onCoachUpdated?: (coachId: string, patch: CoachSavedSnapshot) => void;
  onSaveSuccess?: (message: string) => void;
}) {
  const t = useTranslations("adminPages.coaches");
  const titleId = useId();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlTab = parseCoachSheetTabId(searchParams.get(COACH_PROFILE_TAB_QUERY_KEY));
  const [activeTab, setActiveTab] = useState<CoachSheetTabId>(urlTab);
  const [prevUrlTab, setPrevUrlTab] = useState(urlTab);
  if (urlTab !== prevUrlTab) {
    setPrevUrlTab(urlTab);
    setActiveTab(urlTab);
  }
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ message: string; tone: "ok" | "err" } | null>(
    null,
  );
  const initial = useMemo(() => coachInitialValues(coach), [coach]);

  const updateCoachTabQuery = useCallback(
    (tab: CoachSheetTabId) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === COACH_SHEET_TAB_PROFILE) {
        params.delete(COACH_PROFILE_TAB_QUERY_KEY);
      } else {
        params.set(COACH_PROFILE_TAB_QUERY_KEY, tab);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = parseCoachSheetTabId(value);
      setActiveTab(tab);
      updateCoachTabQuery(tab);
    },
    [updateCoachTabQuery],
  );

  const validationLabels = useMemo(
    () => ({
      emailRequired: t("emailRequired"),
      emailInvalid: t("emailInvalid"),
      phoneInvalid: t("phoneInvalid"),
      ageInvalid: t("ageInvalid", { min: COACH_MIN_AGE, max: COACH_MAX_AGE }),
      birthdayInvalid: t("birthdayInvalid"),
      ageBirthdayMismatch: t("ageBirthdayMismatch"),
      bioTooLong: t("bioTooLong"),
      experienceInvalid: t("experienceInvalid"),
      specializationTooLong: t("specializationTooLong"),
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
    onSaved: (snapshot) => {
      onCoachUpdated?.(coach.id, snapshot);
    },
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
          <div className="flex shrink-0 items-center gap-2">
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
            <button
              type="button"
              className={ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS}
              aria-label={t("modalCloseAria")}
              disabled={sheetBusy}
              onClick={handleClose}
            >
              ×
            </button>
          </div>
        </div>
      </header>

      <AdminDetailSheetTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
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
          void (async () => {
            const successMessage = t("updateSuccess");
            const saved = await editForm.save(successMessage, t("genericError"), {
              silentSuccess: true,
            });
            if (!saved) {
              return;
            }
            onSaveSuccess?.(successMessage);
            onClose();
          })();
        }}
      />
    </OmmDrawerPortal>
  );
}
