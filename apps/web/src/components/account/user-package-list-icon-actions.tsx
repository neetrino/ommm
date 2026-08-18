"use client";

import { useTranslations } from "next-intl";
import type { PackageLifecycleController } from "@/components/account/user-package-lifecycle-actions";
import {
  ADMIN_ACTION_ICON_CLASS,
  CancelGlyph,
  ToggleOffGlyph,
  ToggleOnGlyph,
} from "@/components/ui/admin-action-glyphs";
import { AdminRowIconButton } from "@/components/ui/admin-row-icon-button";

type UserPackageListIconActionsProps = {
  lifecycle: PackageLifecycleController;
  showFreeze: boolean;
  showUnfreeze: boolean;
  showRenew: boolean;
  showCancel: boolean;
  className?: string;
  onAction?: () => void;
};

export function UserPackageListIconActions({
  lifecycle,
  showFreeze,
  showUnfreeze,
  showRenew,
  showCancel,
  className = "",
  onAction,
}: UserPackageListIconActionsProps) {
  const t = useTranslations("forms.packageLifecycle");
  const freezeLabel = t("freeze");
  const unfreezeLabel = t("unfreeze");
  const renewLabel = t("renew");
  const cancelLabel = t("cancelAction");

  return (
    <div
      className={["flex flex-wrap items-center gap-2", className].filter(Boolean).join(" ")}
      role="group"
      aria-label={t("actionsGroupAria")}
    >
      {showFreeze ? (
        <AdminRowIconButton
          ariaLabel={freezeLabel}
          title={freezeLabel}
          disabled={lifecycle.busy}
          onClick={() => {
            onAction?.();
            lifecycle.openConfirm("freeze");
          }}
        >
          <ToggleOffGlyph className={ADMIN_ACTION_ICON_CLASS} />
        </AdminRowIconButton>
      ) : null}
      {showUnfreeze ? (
        <AdminRowIconButton
          ariaLabel={unfreezeLabel}
          title={unfreezeLabel}
          disabled={lifecycle.busy}
          onClick={() => {
            onAction?.();
            lifecycle.openConfirm("unfreeze");
          }}
        >
          <ToggleOnGlyph className={ADMIN_ACTION_ICON_CLASS} />
        </AdminRowIconButton>
      ) : null}
      {showRenew ? (
        <AdminRowIconButton
          ariaLabel={renewLabel}
          title={renewLabel}
          disabled={lifecycle.busy}
          onClick={() => {
            onAction?.();
            lifecycle.runRenew();
          }}
        >
          <ToggleOnGlyph className={ADMIN_ACTION_ICON_CLASS} />
        </AdminRowIconButton>
      ) : null}
      {showCancel ? (
        <AdminRowIconButton
          ariaLabel={cancelLabel}
          title={cancelLabel}
          variant="danger"
          disabled={lifecycle.busy}
          onClick={() => {
            onAction?.();
            lifecycle.openConfirm("cancel");
          }}
        >
          <CancelGlyph className={ADMIN_ACTION_ICON_CLASS} />
        </AdminRowIconButton>
      ) : null}
    </div>
  );
}
