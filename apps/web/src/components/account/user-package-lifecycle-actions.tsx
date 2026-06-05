"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { ApiError, apiFetch } from "@/lib/api";
import type { UserPackageStatus } from "@/lib/user-package-types";

type LifecycleAction = "pause" | "cancel" | "renew";
type ConfirmableAction = "pause" | "cancel";

/** Whether pause, renew, or cancel controls apply for this package status. */
export function hasPackageLifecycleActions(status: UserPackageStatus): boolean {
  return (
    status === "ACTIVE" ||
    status === "PAUSED" ||
    status === "CANCELLED" ||
    status === "EXPIRED"
  );
}

type LifecycleLayout = "inline" | "sheetFooter" | "list" | "board";

type UserPackageLifecycleActionsProps = {
  userPackageId: string;
  status: UserPackageStatus;
  layout?: LifecycleLayout;
};

function layoutConfig(layout: LifecycleLayout): {
  buttonSize: "sm" | "md";
  containerClass: string;
  buttonClass: string;
  messageClass: string;
} {
  if (layout === "sheetFooter") {
    return {
      buttonSize: "md",
      containerClass: "flex w-full flex-wrap items-center justify-center gap-3",
      buttonClass:
        "min-w-[10.5rem] px-10 py-3.5 text-sm font-semibold uppercase tracking-[0.08em]",
      messageClass: "w-full text-center",
    };
  }

  if (layout === "list") {
    return {
      buttonSize: "md",
      containerClass: "flex flex-col items-end gap-2",
      buttonClass: "",
      messageClass: "w-full text-right",
    };
  }

  if (layout === "board") {
    return {
      buttonSize: "md",
      containerClass: "flex w-full flex-col gap-2",
      buttonClass: "",
      messageClass: "w-full text-center",
    };
  }

  return {
    buttonSize: "sm",
    containerClass: "mt-4 flex flex-wrap gap-2",
    buttonClass: "",
    messageClass: "w-full",
  };
}

export function UserPackageLifecycleActions({
  userPackageId,
  status,
  layout = "inline",
}: UserPackageLifecycleActionsProps) {
  const router = useRouter();
  const t = useTranslations("forms.packageLifecycle");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<ConfirmableAction | null>(null);
  const { buttonSize, containerClass, buttonClass, messageClass } = layoutConfig(layout);

  function openConfirm(action: ConfirmableAction) {
    if (busy) {
      return;
    }
    setPendingConfirm(action);
  }

  function closeConfirm() {
    if (busy) {
      return;
    }
    setPendingConfirm(null);
  }

  async function run(action: LifecycleAction, successKey: string, failKey: string) {
    setBusy(true);
    setMessage(null);
    try {
      await apiFetch(`/packages/me/${userPackageId}/${action}`, { method: "PATCH" });
      setMessage(t(successKey));
      setPendingConfirm(null);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t(failKey));
      setPendingConfirm(null);
    } finally {
      setBusy(false);
    }
  }

  const showPause = status === "ACTIVE";
  const showRenew = status === "PAUSED" || status === "CANCELLED" || status === "EXPIRED";
  const showCancel = status === "ACTIVE" || status === "PAUSED";

  if (!hasPackageLifecycleActions(status)) {
    return null;
  }

  const confirmConfig =
    pendingConfirm === "pause"
      ? {
          title: t("pauseConfirmTitle"),
          description: t("pauseConfirmDescription"),
          confirmVariant: "primary" as const,
          onConfirm: () => void run("pause", "pausedSuccess", "pauseFailed"),
        }
      : pendingConfirm === "cancel"
        ? {
            title: t("cancelConfirmTitle"),
            description: t("cancelConfirmDescription"),
            confirmVariant: "danger" as const,
            onConfirm: () => void run("cancel", "cancelledSuccess", "cancelFailed"),
          }
        : null;

  const buttonRowClass =
    layout === "list"
      ? "flex flex-wrap items-center justify-end gap-2"
      : layout === "board"
        ? "flex w-full items-center justify-between gap-3"
        : "flex flex-wrap gap-2";

  return (
    <>
      <div className={containerClass}>
        <div className={buttonRowClass}>
          {showPause ? (
            <OmmButton
              size={buttonSize}
              variant="secondary"
              disabled={busy}
              className={buttonClass}
              onClick={() => openConfirm("pause")}
            >
              {t("pause")}
            </OmmButton>
          ) : null}
          {showRenew ? (
            <OmmButton
              size={buttonSize}
              variant="primary"
              disabled={busy}
              className={buttonClass}
              onClick={() => void run("renew", "renewedSuccess", "renewFailed")}
            >
              {t("renew")}
            </OmmButton>
          ) : null}
          {showCancel ? (
            <OmmButton
              size={buttonSize}
              variant="ghost"
              disabled={busy}
              className={buttonClass}
              onClick={() => openConfirm("cancel")}
            >
              {t("cancelAction")}
            </OmmButton>
          ) : null}
        </div>
        {message !== null ? (
          <p className={`text-xs text-sage-600 ${messageClass}`} role="status">
            {message}
          </p>
        ) : null}
      </div>
      {confirmConfig !== null ? (
        <OmmConfirmDialog
          isOpen
          title={confirmConfig.title}
          description={confirmConfig.description}
          confirmLabel={t("confirmYes")}
          cancelLabel={t("confirmNo")}
          backdropAriaLabel={t("modalBackdropClose")}
          confirmVariant={confirmConfig.confirmVariant}
          pending={busy}
          onConfirm={confirmConfig.onConfirm}
          onCancel={closeConfirm}
        />
      ) : null}
    </>
  );
}
