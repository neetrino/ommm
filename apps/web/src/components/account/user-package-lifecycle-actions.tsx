"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { UserPackageListIconActions } from "@/components/account/user-package-list-icon-actions";
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

type LifecycleLayout = "inline" | "sheetFooter" | "sheetHeader" | "list" | "board";

const PACKAGE_PAUSE_BUTTON_CLASS = "ommm-btn-lifecycle-action--warm";
const PACKAGE_CANCEL_BUTTON_CLASS = "ommm-btn-lifecycle-action--danger";

export type PackageLifecycleController = {
  busy: boolean;
  message: string | null;
  pendingConfirm: ConfirmableAction | null;
  showPause: boolean;
  showRenew: boolean;
  showCancel: boolean;
  openConfirm: (action: ConfirmableAction) => void;
  closeConfirm: () => void;
  runRenew: () => void;
  confirmPause: () => void;
  confirmCancel: () => void;
};

export function useUserPackageLifecycle(
  userPackageId: string,
  status: UserPackageStatus,
): PackageLifecycleController {
  const router = useRouter();
  const t = useTranslations("forms.packageLifecycle");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<ConfirmableAction | null>(null);

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

  return {
    busy,
    message,
    pendingConfirm,
    showPause: status === "ACTIVE",
    showRenew: status === "PAUSED" || status === "CANCELLED" || status === "EXPIRED",
    showCancel: status === "ACTIVE" || status === "PAUSED",
    openConfirm,
    closeConfirm,
    runRenew: () => void run("renew", "renewedSuccess", "renewFailed"),
    confirmPause: () => void run("pause", "pausedSuccess", "pauseFailed"),
    confirmCancel: () => void run("cancel", "cancelledSuccess", "cancelFailed"),
  };
}

type UserPackageLifecycleActionsProps = {
  userPackageId: string;
  status: UserPackageStatus;
  layout?: LifecycleLayout;
  hiddenActions?: readonly LifecycleAction[];
  lifecycle?: PackageLifecycleController;
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

  if (layout === "sheetHeader") {
    return {
      buttonSize: "sm",
      containerClass: "flex flex-wrap items-center justify-start gap-2",
      buttonClass: "px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em]",
      messageClass: "w-full text-right",
    };
  }

  if (layout === "list") {
    return {
      buttonSize: "sm",
      containerClass: "flex flex-col items-end gap-2 md:items-center",
      buttonClass: "",
      messageClass: "w-full text-center md:text-center",
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

function isActionHidden(
  action: LifecycleAction,
  hiddenActions: readonly LifecycleAction[] | undefined,
): boolean {
  return hiddenActions?.includes(action) ?? false;
}

export function UserPackageLifecycleActions({
  userPackageId,
  status,
  layout = "inline",
  hiddenActions,
  lifecycle: externalLifecycle,
}: UserPackageLifecycleActionsProps) {
  const t = useTranslations("forms.packageLifecycle");
  const internalLifecycle = useUserPackageLifecycle(userPackageId, status);
  const lifecycle = externalLifecycle ?? internalLifecycle;
  const ownsDialog = externalLifecycle === undefined;
  const { buttonSize, containerClass, buttonClass, messageClass } = layoutConfig(layout);

  const showPause = lifecycle.showPause && !isActionHidden("pause", hiddenActions);
  const showRenew = lifecycle.showRenew && !isActionHidden("renew", hiddenActions);
  const showCancel = lifecycle.showCancel && !isActionHidden("cancel", hiddenActions);

  if (!hasPackageLifecycleActions(status)) {
    return null;
  }

  if (layout === "sheetHeader") {
    const hasHeaderActions = showPause || showCancel;
    if (!hasHeaderActions) {
      return null;
    }

    return (
      <>
        <div className={containerClass}>
          {showPause ? (
            <OmmButton
              size={buttonSize}
              variant="secondary"
              disabled={lifecycle.busy}
              className={[buttonClass, PACKAGE_PAUSE_BUTTON_CLASS].filter(Boolean).join(" ")}
              onClick={() => lifecycle.openConfirm("pause")}
            >
              {t("pause")}
            </OmmButton>
          ) : null}
          {showCancel ? (
            <OmmButton
              size={buttonSize}
              variant="secondary"
              disabled={lifecycle.busy}
              className={[buttonClass, PACKAGE_CANCEL_BUTTON_CLASS].filter(Boolean).join(" ")}
              onClick={() => lifecycle.openConfirm("cancel")}
            >
              {t("cancelAction")}
            </OmmButton>
          ) : null}
        </div>
        {ownsDialog ? <PackageLifecycleConfirmDialog lifecycle={lifecycle} /> : null}
      </>
    );
  }

  const buttonRowClass =
    layout === "list"
      ? "flex flex-wrap items-center justify-end gap-1.5"
      : layout === "board"
        ? "flex w-full flex-wrap items-center gap-2"
        : "flex flex-wrap gap-2";

  const hasVisibleActions = showPause || showRenew || showCancel;
  if (!hasVisibleActions && lifecycle.message === null) {
    return ownsDialog ? <PackageLifecycleConfirmDialog lifecycle={lifecycle} /> : null;
  }

  const pauseLabel = t("pause");
  const renewLabel = t("renew");
  const cancelLabel = t("cancelAction");

  const listIconActions =
    layout === "list" && hasVisibleActions ? (
      <UserPackageListIconActions
        className="justify-end md:justify-center"
        lifecycle={lifecycle}
        showPause={showPause}
        showRenew={showRenew}
        showCancel={showCancel}
      />
    ) : null;

  return (
    <>
      <div className={containerClass}>
        {layout === "list" ? (
          listIconActions
        ) : hasVisibleActions ? (
          <div className={buttonRowClass}>
            {showPause ? (
              <OmmButton
                size={buttonSize}
                variant="secondary"
                disabled={lifecycle.busy}
                className={[buttonClass, PACKAGE_PAUSE_BUTTON_CLASS].filter(Boolean).join(" ")}
                onClick={() => lifecycle.openConfirm("pause")}
              >
                {pauseLabel}
              </OmmButton>
            ) : null}
            {showRenew ? (
              <OmmButton
                size={buttonSize}
                variant="primary"
                disabled={lifecycle.busy}
                className={buttonClass}
                onClick={lifecycle.runRenew}
              >
                {renewLabel}
              </OmmButton>
            ) : null}
            {showCancel ? (
              <OmmButton
                size={buttonSize}
                variant="secondary"
                disabled={lifecycle.busy}
                className={[buttonClass, PACKAGE_CANCEL_BUTTON_CLASS].filter(Boolean).join(" ")}
                onClick={() => lifecycle.openConfirm("cancel")}
              >
                {cancelLabel}
              </OmmButton>
            ) : null}
          </div>
        ) : null}
        {lifecycle.message !== null ? (
          <p className={`text-xs text-sage-600 ${messageClass}`} role="status">
            {lifecycle.message}
          </p>
        ) : null}
      </div>
      {ownsDialog ? <PackageLifecycleConfirmDialog lifecycle={lifecycle} /> : null}
    </>
  );
}

type PackageLifecycleConfirmDialogProps = {
  lifecycle: PackageLifecycleController;
};

export function PackageLifecycleConfirmDialog({
  lifecycle,
}: PackageLifecycleConfirmDialogProps) {
  const t = useTranslations("forms.packageLifecycle");

  if (lifecycle.pendingConfirm === null) {
    return null;
  }

  const confirmConfig =
    lifecycle.pendingConfirm === "pause"
      ? {
          title: t("pauseConfirmTitle"),
          description: t("pauseConfirmDescription"),
          tone: "warm" as const,
          confirmClassName: PACKAGE_PAUSE_BUTTON_CLASS,
          onConfirm: lifecycle.confirmPause,
        }
      : {
          title: t("cancelConfirmTitle"),
          description: t("cancelConfirmDescription"),
          tone: "danger" as const,
          confirmClassName: PACKAGE_CANCEL_BUTTON_CLASS,
          onConfirm: lifecycle.confirmCancel,
        };

  return (
    <OmmConfirmDialog
      isOpen
      title={confirmConfig.title}
      description={confirmConfig.description}
      confirmLabel={t("confirmYes")}
      cancelLabel={t("confirmNo")}
      backdropAriaLabel={t("modalBackdropClose")}
      tone={confirmConfig.tone}
      confirmClassName={confirmConfig.confirmClassName}
      pending={lifecycle.busy}
      onConfirm={confirmConfig.onConfirm}
      onCancel={lifecycle.closeConfirm}
    />
  );
}
