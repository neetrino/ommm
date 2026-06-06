"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { AdminCoachActions } from "@/components/admin/admin-coach-actions";
import {
  ADMIN_COACH_STATUS_BADGE_CLASS,
  coachStatusBadgeTone,
} from "@/components/admin/admin-coach-list-badges";
import type { CoachClassOption } from "@/components/admin/admin-coach-form-helpers";
import type { AdminCoachDirectoryRow } from "@/components/admin/admin-coaches-types";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { AnimatedToggleSwitch } from "@/components/ui/animated-toggle-switch";
import { AdminRowIconButton } from "@/components/ui/admin-row-icon-button";

const COACH_ROW_TOGGLE_BUTTON_CLASS = "ommm-admin-row-icon-button-toggle";

type AdminCoachRowActionsProps = {
  coach: AdminCoachDirectoryRow;
  classTypeOptions: readonly string[];
  classOptions: readonly CoachClassOption[];
  locale?: string;
};

export function AdminCoachRowActions({
  coach,
  classTypeOptions,
  classOptions,
  locale = "en",
}: AdminCoachRowActionsProps) {
  const t = useTranslations("adminPages.coaches");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const [pendingIsActive, setPendingIsActive] = useState<boolean | null>(null);
  const isActive = pendingIsActive ?? coach.isActive;
  const toggleLabel = isActive ? t("deactivateCoach") : t("activateCoach");
  const statusLabel = isActive ? t("statusActive") : t("statusInactive");

  async function toggleStatus(): Promise<void> {
    if (busy) {
      return;
    }

    const nextIsActive = !isActive;
    setPendingIsActive(nextIsActive);
    setBusy(true);
    setMessage(null);

    try {
      await apiFetch(`/coaches/${coach.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: nextIsActive }),
      });
      setTone("ok");
      setMessage(nextIsActive ? t("activateSuccess") : t("deactivateSuccess"));
      router.refresh();
    } catch (error) {
      setPendingIsActive(null);
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("genericError"));
    } finally {
      setBusy(false);
      setPendingIsActive(null);
    }
  }

  return (
    <>
      <div
        className="flex items-center justify-end gap-2"
        role="group"
        aria-label={t("colActions")}
      >
        <span className={`${ADMIN_COACH_STATUS_BADGE_CLASS} ${coachStatusBadgeTone(isActive)}`}>
          {statusLabel}
        </span>
        <AdminRowIconButton
          ariaLabel={toggleLabel}
          title={toggleLabel}
          className={COACH_ROW_TOGGLE_BUTTON_CLASS}
          disabled={busy}
          onClick={(event) => {
            event.stopPropagation();
            void toggleStatus();
          }}
        >
          <AnimatedToggleSwitch checked={isActive} />
        </AdminRowIconButton>
      </div>

      {message ? (
        <AdminCenterToast
          message={message}
          tone={tone}
          onDismiss={() => setMessage(null)}
        />
      ) : null}

      <AdminCoachActions
        showEditTrigger={false}
        coachId={coach.id}
        locale={locale}
        initialEmail={coach.user.email}
        initialName={coach.user.name ?? ""}
        initialLastName={coach.user.lastName ?? ""}
        initialPhone={coach.user.phone ?? ""}
        initialAge={coach.age}
        initialBirthday={coach.user.dateOfBirth}
        initialPhotoUrl={coach.user.avatarUrl}
        initialBio={coach.bio ?? ""}
        initialExperienceYears={coach.experienceYears}
        initialAssignedClassTypeIds={coach.assignedClassTypeIds}
        initialSchedule={coach.schedule}
        initialSpecialization={coach.specialization ?? ""}
        initialClassType={coach.classType ?? ""}
        classTypeOptions={classTypeOptions}
        classOptions={classOptions}
      />
    </>
  );
}
