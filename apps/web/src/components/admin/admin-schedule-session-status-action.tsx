"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { AdminScheduleSession } from "@/components/admin/admin-schedule-management";
import { AnimatedToggleSwitch } from "@/components/ui/animated-toggle-switch";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { ApiError, apiFetch } from "@/lib/api";

type PendingConfirm = "cancel" | "activate";

const TOGGLE_BUTTON_CLASS =
  "inline-flex shrink-0 items-center justify-center rounded-full p-0 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50";

type AdminScheduleSessionStatusActionProps = {
  sessionId: string;
  status: AdminScheduleSession["status"];
  disabled?: boolean;
  onChanged: (row: AdminScheduleSession) => void;
  onBusyChange?: (busy: boolean) => void;
  onStatusMessage?: (message: string, tone: "ok" | "err") => void;
};

export function AdminScheduleSessionStatusAction({
  sessionId,
  status,
  disabled = false,
  onChanged,
  onBusyChange,
  onStatusMessage,
}: AdminScheduleSessionStatusActionProps) {
  const t = useTranslations("adminPages.classes");
  const [busy, setBusy] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const isCancelled = status === "CANCELLED";
  const isFinished = status === "FINISHED";
  const isDisabled = disabled || busy || isFinished;
  const toggleLabel = isCancelled ? t("activateAction") : t("cancelAction");

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  function openConfirm(): void {
    if (isDisabled) {
      return;
    }
    setPendingConfirm(isCancelled ? "activate" : "cancel");
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
    const nextStatus = pendingConfirm === "activate" ? "ACTIVE" : "CANCELLED";
    setBusy(true);
    try {
      const updated = await apiFetch<AdminScheduleSession>(`/classes/sessions/${sessionId}/status`, {
        method: "POST",
        body: JSON.stringify({ status: nextStatus }),
      });
      onChanged(updated);
      onStatusMessage?.(
        nextStatus === "ACTIVE" ? t("messages.activateSuccess") : t("messages.cancelSuccess"),
        "ok",
      );
      setPendingConfirm(null);
    } catch (requestError) {
      onStatusMessage?.(
        requestError instanceof ApiError ? requestError.message : t("messages.genericError"),
        "err",
      );
    } finally {
      setBusy(false);
    }
  }

  const confirmCopy =
    pendingConfirm === "activate"
      ? {
          title: t("confirm.activateTitle"),
          description: t("confirm.activateDescription"),
          confirmLabel: t("activateAction"),
          tone: "success" as const,
          confirmClassName: "ommm-btn-lifecycle-action--success",
        }
      : {
          title: t("confirm.cancelTitle"),
          description: t("confirm.cancelDescription"),
          confirmLabel: t("cancelAction"),
          tone: "warm" as const,
          confirmClassName: "ommm-btn-lifecycle-action--warm",
        };

  if (isFinished) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={TOGGLE_BUTTON_CLASS}
        aria-label={toggleLabel}
        title={toggleLabel}
        disabled={isDisabled}
        onClick={openConfirm}
      >
        <AnimatedToggleSwitch
          checked={!isCancelled}
          className="ommm-toggle-switch-status ommm-toggle-switch-session"
        />
      </button>

      <OmmConfirmDialog
        isOpen={pendingConfirm !== null}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={busy ? t("savingButton") : confirmCopy.confirmLabel}
        cancelLabel={t("confirmDialogNo")}
        backdropAriaLabel={t("confirmDialogBackdrop")}
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
