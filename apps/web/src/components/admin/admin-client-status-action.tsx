"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { ApiError, apiFetch } from "@/lib/api";
import { OmmButton } from "@/components/ui/omm-button";

type PendingConfirm = "activate" | "deactivate";

type AdminClientStatusActionProps = {
  clientId: string;
  isActive: boolean;
  labels: {
    activate: string;
    deactivate: string;
    saving: string;
    confirmActivate: string;
    confirmDeactivate: string;
    activated: string;
    deactivated: string;
    failed: string;
  };
  layout?: "stacked" | "inline";
  disabled?: boolean;
  onChanged?: () => void;
  onBusyChange?: (busy: boolean) => void;
  onStatusMessage?: (message: string, tone: "ok" | "err") => void;
};

export function AdminClientStatusAction({
  clientId,
  isActive,
  labels,
  layout = "stacked",
  disabled = false,
  onChanged,
  onBusyChange,
  onStatusMessage,
}: AdminClientStatusActionProps) {
  const t = useTranslations("adminPages.clients");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const isDisabled = disabled || busy;

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  function openConfirm(): void {
    if (isDisabled) {
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
      await apiFetch(`/clients/${clientId}`, {
        method: "PATCH",
        body: JSON.stringify({ isBlocked: !nextIsActive }),
      });
      const successMessage = nextIsActive ? labels.activated : labels.deactivated;
      if (layout === "inline") {
        onStatusMessage?.(successMessage, "ok");
      } else {
        setMessage(successMessage);
      }
      onChanged?.();
      router.refresh();
      setPendingConfirm(null);
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : labels.failed;
      if (layout === "inline") {
        onStatusMessage?.(errorMessage, "err");
      } else {
        setMessage(errorMessage);
      }
    } finally {
      setBusy(false);
    }
  }

  const confirmCopy =
    pendingConfirm === "deactivate"
      ? {
          title: labels.deactivate,
          description: labels.confirmDeactivate,
          confirmLabel: labels.deactivate,
          tone: "danger" as const,
          confirmClassName: "ommm-btn-lifecycle-action--danger",
        }
      : {
          title: labels.activate,
          description: labels.confirmActivate,
          confirmLabel: labels.activate,
          tone: "success" as const,
          confirmClassName: "ommm-btn-lifecycle-action--success",
        };

  const actionButton = (
    <OmmButton
      type="button"
      size="sm"
      variant={isActive ? "danger" : "subtle"}
      disabled={isDisabled}
      onClick={openConfirm}
    >
      {busy ? labels.saving : isActive ? labels.deactivate : labels.activate}
    </OmmButton>
  );

  return (
    <>
      {layout === "inline" ? (
        actionButton
      ) : (
        <div className="flex flex-col gap-1">
          {actionButton}
          {message !== null ? (
            <p className="max-w-[12rem] text-xs text-sage-500" role="status">
              {message}
            </p>
          ) : null}
        </div>
      )}

      <OmmConfirmDialog
        isOpen={pendingConfirm !== null}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={busy ? labels.saving : confirmCopy.confirmLabel}
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
