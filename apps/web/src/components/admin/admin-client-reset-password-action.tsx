"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { ApiError, apiFetch } from "@/lib/api";

const RESET_PASSWORD_BUTTON_CLASS =
  "ommm-admin-sidebar-action-button rounded-full px-3 py-1.5 text-[11px] tracking-[0.1em]";

type AdminClientResetPasswordActionProps = {
  email: string;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
  onStatusMessage?: (message: string, tone: "ok" | "err") => void;
};

export function AdminClientResetPasswordAction({
  email,
  disabled = false,
  onBusyChange,
  onStatusMessage,
}: AdminClientResetPasswordActionProps) {
  const t = useTranslations("adminPages.clients");
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isDisabled = disabled || busy || email.trim() === "";

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  function openConfirm(): void {
    if (isDisabled) {
      return;
    }
    setConfirmOpen(true);
  }

  function closeConfirm(): void {
    if (busy) {
      return;
    }
    setConfirmOpen(false);
  }

  async function confirmReset(): Promise<void> {
    if (busy) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === "") {
      return;
    }

    setBusy(true);
    try {
      await apiFetch<{ ok: boolean }>("/auth/request-password-reset", {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail }),
      });
      onStatusMessage?.(t("resetPasswordSuccess"), "ok");
      setConfirmOpen(false);
    } catch (error) {
      onStatusMessage?.(
        error instanceof ApiError ? error.message : t("resetPasswordFailed"),
        "err",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={RESET_PASSWORD_BUTTON_CLASS}
        disabled={isDisabled}
        onClick={openConfirm}
      >
        {busy ? t("resetPasswordSending") : t("resetPassword")}
      </button>
      <OmmConfirmDialog
        isOpen={confirmOpen}
        title={t("resetPassword")}
        description={t("confirmResetPassword", { email: email.trim() })}
        confirmLabel={busy ? t("resetPasswordSending") : t("resetPassword")}
        cancelLabel={t("cancelButton")}
        backdropAriaLabel={t("modalBackdropClose")}
        tone="default"
        pending={busy}
        onConfirm={() => {
          void confirmReset();
        }}
        onCancel={closeConfirm}
      />
    </>
  );
}
