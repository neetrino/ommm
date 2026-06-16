"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { AdminCenterToast } from "@/components/ui/admin-center-toast";
import { AnimatedToggleSwitch } from "@/components/ui/animated-toggle-switch";
import { AdminRowIconButton } from "@/components/ui/admin-row-icon-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";

const PACKAGE_ROW_TOGGLE_BUTTON_CLASS = "ommm-admin-row-icon-button-toggle";

type PendingConfirm = "enable" | "disable";

type AdminPackagePlanStatusActionsProps = {
  packageId: string;
  isActive: boolean;
  onUpdated: (saved: AdminPackageRow) => void;
};

export function AdminPackagePlanStatusActions({
  packageId,
  isActive,
  onUpdated,
}: AdminPackagePlanStatusActionsProps) {
  const t = useTranslations("adminPages.packages");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);
  const toggleLabel = isActive ? t("disableButton") : t("enableButton");

  function openConfirm(): void {
    if (busy) {
      return;
    }
    setPendingConfirm(isActive ? "disable" : "enable");
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

    const nextIsActive = pendingConfirm === "enable";
    setBusy(true);
    setMessage(null);

    try {
      const saved = await apiFetch<AdminPackageRow>(
        `/packages/admin/plans/${packageId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ isActive: nextIsActive }),
        },
      );
      onUpdated(saved);
      setTone("ok");
      setMessage(nextIsActive ? t("messages.enabledSuccess") : t("messages.disabledSuccess"));
      setPendingConfirm(null);
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("genericError"));
    } finally {
      setBusy(false);
    }
  }

  const confirmCopy =
    pendingConfirm === "disable"
      ? {
          title: t("disableButton"),
          description: t("confirmDisable"),
          confirmLabel: t("disableButton"),
          tone: "danger" as const,
          confirmClassName: "ommm-btn-lifecycle-action--danger",
        }
      : {
          title: t("enableButton"),
          description: t("confirmEnable"),
          confirmLabel: t("enableButton"),
          tone: "success" as const,
          confirmClassName: "ommm-btn-lifecycle-action--success",
        };

  return (
    <>
      <AdminRowIconButton
        ariaLabel={toggleLabel}
        title={toggleLabel}
        className={PACKAGE_ROW_TOGGLE_BUTTON_CLASS}
        disabled={busy}
        onClick={(event) => {
          event.stopPropagation();
          openConfirm();
        }}
      >
        <AnimatedToggleSwitch checked={isActive} />
      </AdminRowIconButton>

      {message ? (
        <AdminCenterToast message={message} tone={tone} onDismiss={() => setMessage(null)} />
      ) : null}

      <OmmConfirmDialog
        isOpen={pendingConfirm !== null}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={busy ? t("savingButton") : confirmCopy.confirmLabel}
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
