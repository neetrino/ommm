"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import {
  normalizeUserPackageFreeze,
  type UserPackageFreezeState,
} from "@/lib/user-package-freeze";
import type { UserPackageStatus } from "@/lib/user-package-types";

export type LifecycleAction = "freeze" | "unfreeze" | "cancel" | "renew";
export type ConfirmableAction = "freeze" | "unfreeze" | "cancel";

export function hasPackageLifecycleActions(status: UserPackageStatus): boolean {
  return (
    status === "ACTIVE" ||
    status === "PAUSED" ||
    status === "CANCELLED" ||
    status === "EXPIRED"
  );
}

export type PackageLifecycleController = {
  busy: boolean;
  message: string | null;
  pendingConfirm: ConfirmableAction | null;
  freezeDays: string;
  freeze: UserPackageFreezeState;
  showFreeze: boolean;
  showUnfreeze: boolean;
  showRenew: boolean;
  showCancel: boolean;
  setFreezeDays: (value: string) => void;
  openConfirm: (action: ConfirmableAction) => void;
  closeConfirm: () => void;
  runRenew: () => void;
  confirmFreeze: () => void;
  confirmUnfreeze: () => void;
  confirmCancel: () => void;
};

export function useUserPackageLifecycle(
  userPackageId: string,
  status: UserPackageStatus,
  freezeInput?: UserPackageFreezeState,
): PackageLifecycleController {
  const router = useRouter();
  const t = useTranslations("forms.packageLifecycle");
  const freeze = normalizeUserPackageFreeze(freezeInput);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<ConfirmableAction | null>(
    null,
  );
  const [freezeDays, setFreezeDays] = useState(() =>
    freeze.maxDaysPerUse > 0 ? String(freeze.maxDaysPerUse) : "1",
  );

  function openConfirm(action: ConfirmableAction) {
    if (busy) {
      return;
    }
    if (action === "freeze" && freeze.maxDaysPerUse > 0) {
      setFreezeDays(String(freeze.maxDaysPerUse));
    }
    setPendingConfirm(action);
  }

  function closeConfirm() {
    if (!busy) {
      setPendingConfirm(null);
    }
  }

  async function run(
    path: string,
    successKey: string,
    failKey: string,
    body?: { days: number },
  ) {
    setBusy(true);
    setMessage(null);
    try {
      await apiFetch(`/packages/me/${userPackageId}/${path}`, {
        method: "PATCH",
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
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

  const parsedDays = Number.parseInt(freezeDays, 10);

  return {
    busy,
    message,
    pendingConfirm,
    freezeDays,
    freeze,
    showFreeze: status === "ACTIVE" && freeze.canFreeze,
    showUnfreeze: status === "PAUSED" && freeze.canUnfreeze,
    showRenew: status === "CANCELLED" || status === "EXPIRED",
    showCancel: status === "ACTIVE" || status === "PAUSED",
    setFreezeDays,
    openConfirm,
    closeConfirm,
    runRenew: () => void run("renew", "renewedSuccess", "renewFailed"),
    confirmFreeze: () => {
      if (!Number.isInteger(parsedDays)) {
        return;
      }
      void run("freeze", "frozenSuccess", "freezeFailed", { days: parsedDays });
    },
    confirmUnfreeze: () => void run("unfreeze", "unfrozenSuccess", "unfreezeFailed"),
    confirmCancel: () => void run("cancel", "cancelledSuccess", "cancelFailed"),
  };
}
