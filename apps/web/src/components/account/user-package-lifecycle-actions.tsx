"use client";

import { useTranslations } from "next-intl";
import { UserPackageFreezeDialog } from "@/components/account/user-package-freeze-dialog";
import {
  hasPackageLifecycleActions,
  useUserPackageLifecycle,
  type ConfirmableAction,
  type LifecycleAction,
  type PackageLifecycleController,
} from "@/components/account/user-package-lifecycle";
import { UserPackageListIconActions } from "@/components/account/user-package-list-icon-actions";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import type { UserPackageFreezeState } from "@/lib/user-package-freeze";
import type { UserPackageStatus } from "@/lib/user-package-types";

export {
  hasPackageLifecycleActions,
  useUserPackageLifecycle,
  type PackageLifecycleController,
};

type LifecycleLayout =
  | "inline"
  | "sheetFooter"
  | "sheetHeader"
  | "list"
  | "board"
  | "boardPhone";

const PACKAGE_PAUSE_BUTTON_CLASS = "ommm-btn-lifecycle-action--warm";
const PACKAGE_CANCEL_BUTTON_CLASS = "ommm-btn-lifecycle-action--danger";
const PACKAGE_CANCEL_PHONE_BUTTON_CLASS = [
  "ommm-btn-lifecycle-action--danger",
  "min-h-0 border-red-300 bg-red-100 px-4 py-2",
  "text-xs font-semibold uppercase tracking-[0.08em] text-red-800",
].join(" ");

type UserPackageLifecycleActionsProps = {
  userPackageId: string;
  status: UserPackageStatus;
  freeze?: UserPackageFreezeState;
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
      containerClass: "flex flex-wrap items-center justify-end gap-2",
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
  if (layout === "boardPhone") {
    return {
      buttonSize: "sm",
      containerClass: "flex w-full flex-col items-end gap-1.5",
      buttonClass: "",
      messageClass: "w-full text-right",
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
  freeze,
  layout = "inline",
  hiddenActions,
  lifecycle: externalLifecycle,
}: UserPackageLifecycleActionsProps) {
  const t = useTranslations("forms.packageLifecycle");
  const internalLifecycle = useUserPackageLifecycle(userPackageId, status, freeze);
  const lifecycle = externalLifecycle ?? internalLifecycle;
  const ownsDialog = externalLifecycle === undefined;
  const { buttonSize, containerClass, buttonClass, messageClass } = layoutConfig(layout);
  const showFreeze = lifecycle.showFreeze && !isActionHidden("freeze", hiddenActions);
  const showUnfreeze =
    lifecycle.showUnfreeze && !isActionHidden("unfreeze", hiddenActions);
  const showRenew = lifecycle.showRenew && !isActionHidden("renew", hiddenActions);
  const showCancel = lifecycle.showCancel && !isActionHidden("cancel", hiddenActions);

  if (!hasPackageLifecycleActions(status)) {
    return null;
  }

  const dialog = ownsDialog ? <PackageLifecycleDialogs lifecycle={lifecycle} /> : null;
  const freezeLabel = t("freeze");
  const unfreezeLabel = t("unfreeze");
  const renewLabel = t("renew");
  const cancelLabel = t("cancelAction");

  if (layout === "sheetHeader") {
    if (!showFreeze && !showUnfreeze && !showCancel) {
      return dialog;
    }
    return (
      <>
        <div className={containerClass}>
          <LifecycleButtons
            size={buttonSize}
            className={buttonClass}
            lifecycle={lifecycle}
            showFreeze={showFreeze}
            showUnfreeze={showUnfreeze}
            showRenew={false}
            showCancel={showCancel}
            freezeLabel={freezeLabel}
            unfreezeLabel={unfreezeLabel}
            renewLabel={renewLabel}
            cancelLabel={cancelLabel}
            compactCancel
          />
        </div>
        {dialog}
      </>
    );
  }

  const hasVisibleActions = showFreeze || showUnfreeze || showRenew || showCancel;
  if (!hasVisibleActions && lifecycle.message === null) {
    return dialog;
  }

  return (
    <>
      <div className={containerClass}>
        {layout === "list" && hasVisibleActions ? (
          <UserPackageListIconActions
            className="justify-end md:justify-center"
            lifecycle={lifecycle}
            showFreeze={showFreeze}
            showUnfreeze={showUnfreeze}
            showRenew={showRenew}
            showCancel={showCancel}
          />
        ) : hasVisibleActions ? (
          <div
            className={
              layout === "board"
                ? "flex w-full flex-wrap items-center gap-2"
                : layout === "boardPhone"
                  ? "flex w-full flex-wrap items-center justify-end gap-2"
                  : "flex flex-wrap gap-2"
            }
          >
            <LifecycleButtons
              size={buttonSize}
              className={buttonClass}
              lifecycle={lifecycle}
              showFreeze={showFreeze}
              showUnfreeze={showUnfreeze}
              showRenew={showRenew}
              showCancel={showCancel}
              freezeLabel={freezeLabel}
              unfreezeLabel={unfreezeLabel}
              renewLabel={renewLabel}
              cancelLabel={cancelLabel}
              compactCancel={layout === "boardPhone"}
            />
          </div>
        ) : null}
        {lifecycle.message !== null ? (
          <p className={`text-xs text-sage-600 ${messageClass}`} role="status">
            {lifecycle.message}
          </p>
        ) : null}
      </div>
      {dialog}
    </>
  );
}

type LifecycleButtonsProps = {
  size: "sm" | "md";
  className: string;
  lifecycle: PackageLifecycleController;
  showFreeze: boolean;
  showUnfreeze: boolean;
  showRenew: boolean;
  showCancel: boolean;
  freezeLabel: string;
  unfreezeLabel: string;
  renewLabel: string;
  cancelLabel: string;
  compactCancel?: boolean;
};

function LifecycleButtons({
  size,
  className,
  lifecycle,
  showFreeze,
  showUnfreeze,
  showRenew,
  showCancel,
  freezeLabel,
  unfreezeLabel,
  renewLabel,
  cancelLabel,
  compactCancel = false,
}: LifecycleButtonsProps) {
  return (
    <>
      {showFreeze ? (
        <OmmButton
          size={size}
          variant="secondary"
          disabled={lifecycle.busy}
          className={[className, PACKAGE_PAUSE_BUTTON_CLASS].filter(Boolean).join(" ")}
          onClick={() => lifecycle.openConfirm("freeze")}
        >
          {freezeLabel}
        </OmmButton>
      ) : null}
      {showUnfreeze ? (
        <OmmButton
          size={size}
          variant="secondary"
          disabled={lifecycle.busy}
          className={className}
          onClick={() => lifecycle.openConfirm("unfreeze")}
        >
          {unfreezeLabel}
        </OmmButton>
      ) : null}
      {showRenew ? (
        <OmmButton
          size={size}
          variant="primary"
          disabled={lifecycle.busy}
          className={className}
          onClick={lifecycle.runRenew}
        >
          {renewLabel}
        </OmmButton>
      ) : null}
      {showCancel ? (
        <OmmButton
          size={size}
          variant="secondary"
          disabled={lifecycle.busy}
          className={[
            className,
            compactCancel ? PACKAGE_CANCEL_PHONE_BUTTON_CLASS : PACKAGE_CANCEL_BUTTON_CLASS,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => lifecycle.openConfirm("cancel")}
        >
          {cancelLabel}
        </OmmButton>
      ) : null}
    </>
  );
}

export function PackageLifecycleConfirmDialog({
  lifecycle,
}: {
  lifecycle: PackageLifecycleController;
}) {
  return <PackageLifecycleDialogs lifecycle={lifecycle} />;
}

function PackageLifecycleDialogs({
  lifecycle,
}: {
  lifecycle: PackageLifecycleController;
}) {
  const t = useTranslations("forms.packageLifecycle");
  if (lifecycle.pendingConfirm === "freeze") {
    return (
      <UserPackageFreezeDialog
        days={lifecycle.freezeDays}
        maxDays={Math.max(1, lifecycle.freeze.maxDaysPerUse)}
        remainingCount={lifecycle.freeze.remainingCount}
        pending={lifecycle.busy}
        onDaysChange={lifecycle.setFreezeDays}
        onConfirm={lifecycle.confirmFreeze}
        onCancel={lifecycle.closeConfirm}
      />
    );
  }
  if (lifecycle.pendingConfirm === null) {
    return null;
  }
  const config = resolveConfirmConfig(lifecycle.pendingConfirm, t, lifecycle);
  return (
    <OmmConfirmDialog
      isOpen
      title={config.title}
      description={config.description}
      confirmLabel={t("confirmYes")}
      cancelLabel={t("confirmNo")}
      backdropAriaLabel={t("modalBackdropClose")}
      tone={config.tone}
      confirmClassName={config.confirmClassName}
      pending={lifecycle.busy}
      forceCenteredModal
      onConfirm={config.onConfirm}
      onCancel={lifecycle.closeConfirm}
    />
  );
}

function resolveConfirmConfig(
  action: Exclude<ConfirmableAction, "freeze">,
  t: (key: string) => string,
  lifecycle: PackageLifecycleController,
) {
  if (action === "unfreeze") {
    return {
      title: t("unfreezeConfirmTitle"),
      description: t("unfreezeConfirmDescription"),
      tone: "warm" as const,
      confirmClassName: PACKAGE_PAUSE_BUTTON_CLASS,
      onConfirm: lifecycle.confirmUnfreeze,
    };
  }
  return {
    title: t("cancelConfirmTitle"),
    description: t("cancelConfirmDescription"),
    tone: "danger" as const,
    confirmClassName: PACKAGE_CANCEL_BUTTON_CLASS,
    onConfirm: lifecycle.confirmCancel,
  };
}
