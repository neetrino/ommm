"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { ApiError, apiFetch } from "@/lib/api";
import { dispatchNotificationsRefresh } from "@/lib/notifications-refresh-event";

type LeaveWaitlistButtonProps = {
  sessionId: string;
  appearance?: "link" | "button";
  size?: "sm" | "md";
  wrapperClassName?: string;
  onLeft?: () => void;
};

const LEAVE_WAITLIST_BUTTON_CLASS = "ommm-btn-lifecycle-action--danger";

/**
 * Member waitlist leave control — confirm dialog, then DELETE /waitlist/sessions/:id.
 */
export function LeaveWaitlistButton({
  sessionId,
  appearance = "link",
  size = "sm",
  wrapperClassName,
  onLeft,
}: LeaveWaitlistButtonProps) {
  const router = useRouter();
  const t = useTranslations("forms.leaveWaitlist");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function openConfirm() {
    if (busy || confirmOpen) {
      return;
    }
    setMsg(null);
    setConfirmOpen(true);
  }

  function closeConfirm() {
    if (busy) {
      return;
    }
    setConfirmOpen(false);
  }

  async function confirmLeave() {
    if (busy) {
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch(`/waitlist/sessions/${sessionId}`, { method: "DELETE" });
      setConfirmOpen(false);
      onLeft?.();
      dispatchNotificationsRefresh();
      router.refresh();
    } catch (error) {
      setMsg(error instanceof ApiError ? error.message : t("failed"));
      setConfirmOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className={wrapperClassName ?? "flex flex-col items-start gap-1"}>
        {msg ? <p className="mb-2 whitespace-nowrap text-xs leading-none text-amber-800">{msg}</p> : null}
        {appearance === "button" ? (
          <OmmButton
            type="button"
            variant="danger"
            size={size}
            disabled={busy}
            className={LEAVE_WAITLIST_BUTTON_CLASS}
            onClick={openConfirm}
          >
            {t("action")}
          </OmmButton>
        ) : (
          <button
            type="button"
            disabled={busy}
            className={LEAVE_WAITLIST_BUTTON_CLASS}
            onClick={openConfirm}
          >
            {t("action")}
          </button>
        )}
      </div>
      <OmmConfirmDialog
        isOpen={confirmOpen}
        title={t("confirmTitle")}
        description={t("confirmDescription")}
        confirmLabel={busy ? t("action") : t("confirmLeave")}
        cancelLabel={t("confirmCancel")}
        backdropAriaLabel={t("confirmBackdrop")}
        tone="danger"
        confirmClassName={LEAVE_WAITLIST_BUTTON_CLASS}
        pending={busy}
        forceCenteredModal
        onConfirm={() => {
          void confirmLeave();
        }}
        onCancel={closeConfirm}
      />
    </>
  );
}
