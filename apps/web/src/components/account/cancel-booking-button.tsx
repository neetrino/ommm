"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useRef, useState } from "react";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { useBookingCancelUrlState } from "@/hooks/use-booking-cancel-url-state";
import { ApiError, apiFetch } from "@/lib/api";
import {
  clearBookingCancelIntent,
  registerBookingCancelIntent,
} from "@/lib/booking-cancel-intent";
import { isPenalizedCancellation } from "@/lib/cancellation-policy";
import { dispatchNotificationsRefresh } from "@/lib/notifications-refresh-event";
import {
  BOOKING_CANCEL_CONFIRM_DELAY_MS,
  SCHEDULE_CLOCK_TICK_MS,
} from "@/lib/public-schedule-constants";

type Props = {
  bookingId: string;
  sessionDate?: string | null;
  sessionStartTime?: string | null;
  appearance?: "link" | "button";
  size?: "sm" | "md";
  buttonClassName?: string;
  wrapperClassName?: string;
  onCancelled?: () => void;
};

const CANCEL_BOOKING_BUTTON_CLASS = "ommm-btn-lifecycle-action--danger";

export function CancelBookingButton({
  bookingId,
  sessionDate,
  sessionStartTime,
  appearance = "link",
  size = "md",
  buttonClassName,
  wrapperClassName,
  onCancelled,
}: Props) {
  const router = useRouter();
  const t = useTranslations("forms.cancelBooking");
  const { cancelBookingId, openCancelBooking, closeCancelBooking } = useBookingCancelUrlState();
  const confirmOpen = cancelBookingId === bookingId;
  const [confirmDelayPassed, setConfirmDelayPassed] = useState(false);
  const confirmReady = confirmOpen && confirmDelayPassed;
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const intentSyncRef = useRef<string | null>(null);
  const buttonSize = appearance === "link" ? "sm" : size;

  const hasSessionTiming =
    sessionDate !== undefined &&
    sessionDate !== null &&
    sessionStartTime !== undefined &&
    sessionStartTime !== null &&
    sessionStartTime.length > 0;

  const penalized =
    hasSessionTiming &&
    isPenalizedCancellation(sessionDate, sessionStartTime, undefined, new Date(nowMs));

  useEffect(() => {
    if (!confirmOpen || !hasSessionTiming) {
      return undefined;
    }
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, SCHEDULE_CLOCK_TICK_MS);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [confirmOpen, hasSessionTiming]);

  useEffect(() => {
    if (!confirmOpen) {
      intentSyncRef.current = null;
      return undefined;
    }

    if (intentSyncRef.current !== bookingId) {
      intentSyncRef.current = bookingId;
      void registerBookingCancelIntent(bookingId).catch((error) => {
        if (intentSyncRef.current !== bookingId) {
          return;
        }
        setMsg(error instanceof ApiError ? error.message : t("failed"));
        closeCancelBooking();
      });
    }

    const timeoutId = window.setTimeout(() => {
      setConfirmDelayPassed(true);
    }, BOOKING_CANCEL_CONFIRM_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [bookingId, closeCancelBooking, confirmOpen, t]);

  function openConfirm() {
    if (busy || confirmOpen) {
      return;
    }
    setMsg(null);
    setConfirmDelayPassed(false);
    setNowMs(Date.now());
    openCancelBooking(bookingId);
  }

  function closeConfirm() {
    if (busy) {
      return;
    }
    closeCancelBooking();
    setConfirmDelayPassed(false);
    void clearBookingCancelIntent(bookingId).catch(() => {
      // Spot hold expires server-side; schedule poll will reconcile.
    });
  }

  async function confirmCancel() {
    if (!confirmReady || busy) {
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch(`/bookings/${bookingId}`, { method: "DELETE" });
      closeCancelBooking();
      onCancelled?.();
      dispatchNotificationsRefresh();
      router.refresh();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : t("failed"));
      closeCancelBooking();
      try {
        await clearBookingCancelIntent(bookingId);
      } catch {
        // Hold will expire automatically.
      }
    } finally {
      setBusy(false);
    }
  }

  const resolvedButtonClass = buttonClassName ?? CANCEL_BOOKING_BUTTON_CLASS;
  const useNativeButton = buttonClassName !== undefined;
  const dialogTitle = penalized ? t("penaltyConfirmTitle") : t("confirmTitle");
  const dialogDescription = penalized ? t("penaltyConfirm") : t("confirm");

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
        title={dialogTitle}
        description={dialogDescription}
        confirmLabel={t("action")}
        cancelLabel={t("confirmNo")}
        backdropAriaLabel={t("modalBackdropClose")}
        tone="danger"
        confirmClassName={CANCEL_BOOKING_BUTTON_CLASS}
        pending={busy}
        confirmPending={busy || !confirmReady}
        onConfirm={() => void confirmCancel()}
        onCancel={closeConfirm}
      />
    </>
  );
}
