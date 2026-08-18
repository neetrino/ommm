"use client";

import { useState, type MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { revalidatePublicCoaches } from "@/lib/revalidate-public-coaches";
import type { CoachClassOption } from "@/components/admin/admin-coach-form-helpers";
import type { AdminCoachDirectoryRow } from "@/components/admin/admin-coaches-types";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { AnimatedToggleSwitch } from "@/components/ui/animated-toggle-switch";
import { AdminRowIconButton } from "@/components/ui/admin-row-icon-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";

const COACH_ROW_TOGGLE_BUTTON_CLASS = "ommm-admin-row-icon-button-toggle";
const COACH_BOARD_TOGGLE_BUTTON_CLASS =
  "inline-flex shrink-0 cursor-pointer items-center rounded-full p-1 transition-opacity hover:opacity-85 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-40";

type PendingConfirm = "activate" | "deactivate";
type CoachRowActionsVariant = "list" | "board";

type AdminCoachRowActionsProps = {
  coach: AdminCoachDirectoryRow;
  classTypeOptions: readonly string[];
  classOptions: readonly CoachClassOption[];
  locale?: string;
  variant?: CoachRowActionsVariant;
};

function CoachStatusToggle({
  variant,
  checked,
  label,
  disabled,
  onClick,
}: {
  variant: CoachRowActionsVariant;
  checked: boolean;
  label: string;
  disabled: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  if (variant === "board") {
    return (
      <button
        type="button"
        className={COACH_BOARD_TOGGLE_BUTTON_CLASS}
        aria-label={label}
        title={label}
        disabled={disabled}
        onClick={onClick}
      >
        <AnimatedToggleSwitch checked={checked} className="ommm-toggle-switch-board" />
      </button>
    );
  }

  return (
    <AdminRowIconButton
      ariaLabel={label}
      title={label}
      className={COACH_ROW_TOGGLE_BUTTON_CLASS}
      disabled={disabled}
      onClick={onClick}
    >
      <AnimatedToggleSwitch checked={checked} />
    </AdminRowIconButton>
  );
}

export function AdminCoachRowActions({
  coach,
  variant = "list",
}: AdminCoachRowActionsProps) {
  const t = useTranslations("adminPages.coaches");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const isActive = coach.isActive;
  const toggleLabel = isActive ? t("deactivateCoach") : t("activateCoach");

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
        <CoachStatusToggle
          variant={variant}
          checked={isActive}
          label={toggleLabel}
          disabled={busy}
          onClick={(event) => {
            event.stopPropagation();
            openConfirm();
          }}
        />
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
