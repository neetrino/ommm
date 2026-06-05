"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import type { UserPackageStatus } from "@/lib/user-package-types";

type LifecycleAction = "pause" | "cancel" | "renew";

type UserPackageLifecycleActionsProps = {
  userPackageId: string;
  status: UserPackageStatus;
  layout?: "inline" | "sheetFooter";
};

export function UserPackageLifecycleActions({
  userPackageId,
  status,
  layout = "inline",
}: UserPackageLifecycleActionsProps) {
  const router = useRouter();
  const t = useTranslations("forms.packageLifecycle");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run(action: LifecycleAction, successKey: string, failKey: string) {
    setBusy(true);
    setMessage(null);
    try {
      await apiFetch(`/packages/me/${userPackageId}/${action}`, { method: "PATCH" });
      setMessage(t(successKey));
      router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t(failKey));
    } finally {
      setBusy(false);
    }
  }

  const showPause = status === "ACTIVE";
  const showRenew = status === "PAUSED" || status === "CANCELLED" || status === "EXPIRED";
  const showCancel = status === "ACTIVE" || status === "PAUSED";

  if (!showPause && !showRenew && !showCancel) {
    return null;
  }

  const isSheetFooter = layout === "sheetFooter";
  const buttonSize = isSheetFooter ? "md" : "sm";
  const containerClass = isSheetFooter
    ? "flex w-full flex-wrap items-center justify-center gap-3"
    : "mt-4 flex flex-wrap gap-2";
  const buttonClass = isSheetFooter
    ? "min-w-[10.5rem] px-10 py-3.5 text-sm font-semibold uppercase tracking-[0.08em]"
    : "";

  return (
    <div className={containerClass}>
      {showPause ? (
        <OmmButton
          size={buttonSize}
          variant="secondary"
          disabled={busy}
          className={buttonClass}
          onClick={() => void run("pause", "pausedSuccess", "pauseFailed")}
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
          onClick={() => void run("cancel", "cancelledSuccess", "cancelFailed")}
        >
          {t("cancelAction")}
        </OmmButton>
      ) : null}
      {message !== null ? (
        <p
          className={`text-xs text-sage-600 ${isSheetFooter ? "w-full text-center" : "w-full"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
