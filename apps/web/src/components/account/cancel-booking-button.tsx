"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { ApiError, apiFetch } from "@/lib/api";
import { dispatchNotificationsRefresh } from "@/lib/notifications-refresh-event";

type Props = {
  bookingId: string;
  appearance?: "link" | "button";
  size?: "sm" | "md";
  buttonClassName?: string;
  wrapperClassName?: string;
  onCancelled?: () => void;
};

const CANCEL_BOOKING_BUTTON_CLASS = "ommm-btn-lifecycle-action--danger";

export function CancelBookingButton({
  bookingId,
  appearance = "link",
  size = "md",
  buttonClassName,
  wrapperClassName,
  onCancelled,
}: Props) {
  const router = useRouter();
  const t = useTranslations("forms.cancelBooking");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const buttonSize = appearance === "link" ? "sm" : size;

  function openConfirm() {
    if (busy) {
      return;
    }
    setConfirmOpen(true);
  }

  function closeConfirm() {
    if (busy) {
      return;
    }
    setConfirmOpen(false);
  }

  async function confirmCancel() {
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch(`/bookings/${bookingId}`, { method: "DELETE" });
      setConfirmOpen(false);
      onCancelled?.();
      dispatchNotificationsRefresh();
      router.refresh();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : t("failed"));
      setConfirmOpen(false);
    } finally {
      setBusy(false);
    }
  }

  const resolvedButtonClass = buttonClassName ?? CANCEL_BOOKING_BUTTON_CLASS;
  const useNativeButton = buttonClassName !== undefined;

  return (
    <>
      <div className={wrapperClassName ?? "flex flex-col items-start gap-1"}>
        {useNativeButton ? (
          <button
            type="button"
            disabled={busy}
            className={resolvedButtonClass}
            onClick={openConfirm}
          >
            {t("action")}
          </button>
        ) : (
          <OmmButton
            type="button"
            variant="secondary"
            size={buttonSize}
            disabled={busy}
            className={resolvedButtonClass}
            onClick={openConfirm}
          >
            {t("action")}
          </OmmButton>
        )}
        {msg ? <p className="text-xs text-amber-800">{msg}</p> : null}
      </div>
      <OmmConfirmDialog
        isOpen={confirmOpen}
        title={t("confirmTitle")}
        description={t("confirm")}
        confirmLabel={t("action")}
        cancelLabel={t("confirmNo")}
        backdropAriaLabel={t("modalBackdropClose")}
        tone="danger"
        confirmClassName={CANCEL_BOOKING_BUTTON_CLASS}
        pending={busy}
        onConfirm={() => void confirmCancel()}
        onCancel={closeConfirm}
      />
    </>
  );
}
