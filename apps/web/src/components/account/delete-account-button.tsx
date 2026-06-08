"use client";

import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

const DELETE_ACCOUNT_TRIGGER_CLASS =
  "text-sm text-sage-500 underline decoration-sage-300/80 underline-offset-4 transition hover:text-red-700 hover:decoration-red-300/80 disabled:cursor-not-allowed disabled:opacity-50";

const DELETE_ACCOUNT_CONFIRM_CLASS = "ommm-btn-lifecycle-action--danger";

type DeleteAccountButtonProps = {
  triggerClassName?: string;
  triggerContent?: ReactNode;
  /** Shown while pending when `triggerContent` is a menu row layout. */
  busyTriggerContent?: ReactNode;
  /** When true, omit outer wrapper — for account hub menu rows. */
  bare?: boolean;
  /** Profile page: red pill button; hub/menu keeps link or custom row. */
  appearance?: "link" | "dangerButton";
};

export function DeleteAccountButton({
  triggerClassName,
  triggerContent,
  busyTriggerContent,
  bare = false,
  appearance = "link",
}: DeleteAccountButtonProps = {}) {
  const t = useTranslations("userPages.profile");
  const locale = useLocale();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function openConfirm() {
    if (busy) {
      return;
    }
    setMessage(null);
    setConfirmOpen(true);
  }

  function closeConfirm() {
    if (busy) {
      return;
    }
    setConfirmOpen(false);
  }

  async function confirmDelete() {
    setBusy(true);
    setMessage(null);
    try {
      await apiFetch<{ ok: boolean }>("/users/me", { method: "DELETE" });
      setConfirmOpen(false);
      try {
        await apiFetch<{ ok: boolean }>("/auth/logout", { method: "POST" });
      } catch {
        // Session cookie is cleared by DELETE /users/me; logout is best-effort.
      }
      router.replace("/", { locale });
      router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t("deleteAccountFailed"));
      setConfirmOpen(false);
    } finally {
      setBusy(false);
    }
  }

  const triggerLabel = busy
    ? (busyTriggerContent ??
      (triggerContent !== undefined ? triggerContent : t("deleteAccountDeleting")))
    : (triggerContent ?? t("deleteAccount"));

  const useDangerButton =
    appearance === "dangerButton" &&
    triggerClassName === undefined &&
    triggerContent === undefined;

  const trigger = useDangerButton ? (
    <OmmButton variant="danger" onClick={openConfirm} disabled={busy}>
      {busy ? t("deleteAccountDeleting") : t("deleteAccount")}
    </OmmButton>
  ) : (
    <button
      type="button"
      className={triggerClassName ?? DELETE_ACCOUNT_TRIGGER_CLASS}
      onClick={openConfirm}
      disabled={busy}
    >
      {triggerLabel}
    </button>
  );

  return (
    <>
      {bare ? (
        trigger
      ) : (
        <div className="flex flex-col items-start gap-1">
          {trigger}
          {message ? <p className="text-xs text-red-800">{message}</p> : null}
        </div>
      )}
      <OmmConfirmDialog
        isOpen={confirmOpen}
        title={t("deleteAccountConfirmTitle")}
        description={t("deleteAccountConfirmDescription")}
        confirmLabel={t("deleteAccountConfirmYes")}
        cancelLabel={t("deleteAccountConfirmNo")}
        backdropAriaLabel={t("deleteAccountBackdropClose")}
        tone="danger"
        confirmClassName={DELETE_ACCOUNT_CONFIRM_CLASS}
        pending={busy}
        onConfirm={() => void confirmDelete()}
        onCancel={closeConfirm}
      />
    </>
  );
}
