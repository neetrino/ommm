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
};

export function UserPackageLifecycleActions({
  userPackageId,
  status,
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

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {showPause ? (
        <OmmButton
          size="sm"
          variant="secondary"
          disabled={busy}
          onClick={() => void run("pause", "pausedSuccess", "pauseFailed")}
        >
          {t("pause")}
        </OmmButton>
      ) : null}
      {showRenew ? (
        <OmmButton
          size="sm"
          variant="primary"
          disabled={busy}
          onClick={() => void run("renew", "renewedSuccess", "renewFailed")}
        >
          {t("renew")}
        </OmmButton>
      ) : null}
      {showCancel ? (
        <OmmButton
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={() => void run("cancel", "cancelledSuccess", "cancelFailed")}
        >
          {t("cancelAction")}
        </OmmButton>
      ) : null}
      {message !== null ? (
        <p className="w-full text-xs text-sage-600" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
