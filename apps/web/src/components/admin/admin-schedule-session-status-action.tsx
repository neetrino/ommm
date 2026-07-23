"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { AdminScheduleSession } from "@/components/admin/admin-schedule-management";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

type PendingConfirm = "cancel" | "activate";

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
  const isDisabled = disabled || busy;

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
          tone: "danger" as const,
          confirmClassName: "ommm-btn-lifecycle-action--danger",
        };

  return (
    <>
      <OmmButton
        type="button"
        size="sm"
        variant={isCancelled ? "secondary" : "ghost"}
        disabled={isDisabled}
        onClick={openConfirm}
      >
        {busy ? t("savingButton") : isCancelled ? t("activateAction") : t("cancelAction")}
      </OmmButton>

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
