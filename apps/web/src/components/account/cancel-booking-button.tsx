"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { ApiError, apiFetch } from "@/lib/api";
import {
  clearBookingCancelIntent,
  registerBookingCancelIntent,
} from "@/lib/booking-cancel-intent";
import { dispatchNotificationsRefresh } from "@/lib/notifications-refresh-event";
import { BOOKING_CANCEL_CONFIRM_DELAY_MS } from "@/lib/public-schedule-constants";

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
  const [confirmReady, setConfirmReady] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const buttonSize = appearance === "link" ? "sm" : size;

  useEffect(() => {
    if (!confirmOpen) {
      return undefined;
    }
    const timeoutId = window.setTimeout(() => {
      setConfirmReady(true);
    }, BOOKING_CANCEL_CONFIRM_DELAY_MS);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [confirmOpen]);

  async function openConfirm() {
    if (busy) {
      return;
    }
    setMsg(null);
    setConfirmReady(false);
    try {
      await registerBookingCancelIntent(bookingId);
      dispatchNotificationsRefresh();
      setConfirmOpen(true);
    } catch (error) {
      setMsg(error instanceof ApiError ? error.message : t("failed"));
    }
  }

  async function closeConfirm() {
    if (busy) {
      return;
    }
    setConfirmOpen(false);
    setConfirmReady(false);
    try {
      await clearBookingCancelIntent(bookingId);
      dispatchNotificationsRefresh();
    } catch {
      // Spot hold expires server-side; schedule poll will reconcile.
    }
  }

  async function confirmCancel() {
    if (!confirmReady) {
      return;
    }
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
      try {
        await clearBookingCancelIntent(bookingId);
        dispatchNotificationsRefresh();
      } catch {
        // Hold will expire automatically.
      }
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
            onClick={() => void openConfirm()}
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
            onClick={() => void openConfirm()}
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
        pending={busy || !confirmReady}
        onConfirm={() => void confirmCancel()}
        onCancel={() => void closeConfirm()}
      />
    </>
  );
}
