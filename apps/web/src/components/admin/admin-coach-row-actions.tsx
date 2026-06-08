"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { revalidatePublicCoaches } from "@/lib/revalidate-public-coaches";
import {
  ADMIN_COACH_STATUS_BADGE_CLASS,
  coachStatusBadgeTone,
} from "@/components/admin/admin-coach-list-badges";
import type { CoachClassOption } from "@/components/admin/admin-coach-form-helpers";
import type { AdminCoachDirectoryRow } from "@/components/admin/admin-coaches-types";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { AnimatedToggleSwitch } from "@/components/ui/animated-toggle-switch";
import { AdminRowIconButton } from "@/components/ui/admin-row-icon-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";

const COACH_ROW_TOGGLE_BUTTON_CLASS = "ommm-admin-row-icon-button-toggle";

type PendingConfirm = "activate" | "deactivate";

type AdminCoachRowActionsProps = {
  coach: AdminCoachDirectoryRow;
  classTypeOptions: readonly string[];
  classOptions: readonly CoachClassOption[];
  locale?: string;
};

export function AdminCoachRowActions({
  coach,
}: AdminCoachRowActionsProps) {
  const t = useTranslations("adminPages.coaches");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const isActive = coach.isActive;
  const toggleLabel = isActive ? t("deactivateCoach") : t("activateCoach");
  const statusLabel = isActive ? t("statusActive") : t("statusInactive");

  function openConfirm(): void {
    if (busy) {
      return;
    }
    setPendingConfirm(isActive ? "deactivate" : "activate");
  }

  function closeConfirm(): void {
    if (busy) {
      return;
    }
    setPendingConfirm(null);
  }

  async function confirmStatusChange(): Promise<void> {
    if (busy || pendingConfirm === null) {
      return;
    }

    const nextIsActive = pendingConfirm === "activate";
    setBusy(true);
    setMessage(null);

    try {
      await apiFetch(`/coaches/${coach.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: nextIsActive }),
      });
      setTone("ok");
      setMessage(nextIsActive ? t("activateSuccess") : t("deactivateSuccess"));
      setPendingConfirm(null);
      await revalidatePublicCoaches();
      router.refresh();
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("genericError"));
    } finally {
      setBusy(false);
    }
  }

  const confirmCopy =
    pendingConfirm === "deactivate"
      ? {
          title: t("deactivateCoach"),
          description: t("confirmDeactivate"),
          confirmLabel: t("deactivateCoach"),
          tone: "danger" as const,
          confirmClassName: "ommm-btn-lifecycle-action--danger",
        }
      : {
          title: t("activateCoach"),
          description: t("confirmActivate"),
          confirmLabel: t("activateCoach"),
          tone: "success" as const,
          confirmClassName: "ommm-btn-lifecycle-action--success",
        };

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
            openConfirm();
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

      <OmmConfirmDialog
        isOpen={pendingConfirm !== null}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={busy ? t("savingButton") : confirmCopy.confirmLabel}
        cancelLabel={t("cancelButton")}
        backdropAriaLabel={t("modalBackdropClose")}
        tone={confirmCopy.tone}
        confirmClassName={confirmCopy.confirmClassName}
        pending={busy}
        onConfirm={() => {
          void confirmStatusChange();
        }}
        onCancel={closeConfirm}
      />
    </>
  );
}
