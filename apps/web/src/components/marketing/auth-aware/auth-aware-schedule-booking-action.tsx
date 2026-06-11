"use client";

import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import {
  CancelBookingButton,
  CANCEL_BOOKING_ERROR_MESSAGE_CLASS,
} from "@/components/account/cancel-booking-button";
import { SESSION_BOOKED_BUTTON_SM_CLASS } from "@/components/account/session-booked-badge";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import {
  SCHEDULE_BOOK_BTN,
  SCHEDULE_CANCEL_BTN,
} from "@/components/marketing/schedule/schedule-public-design";
import { Link, useRouter } from "@/i18n/navigation";
import { OmmmCenterToast } from "@/components/ui/ommm-center-toast";
import { ApiError, apiFetch } from "@/lib/api";
import { buildLoginHrefWithReturnUrl } from "@/lib/auth-redirect";
import { dispatchNotificationsRefresh } from "@/lib/notifications-refresh-event";
import { isScheduleSessionFull } from "@/lib/schedule-session-spots";

const SCHEDULE_RETURN_PATH = "/schedule";

type BookSessionResponse = {
  id: string;
};

type AuthAwareScheduleBookingActionProps = {
  sessionId: string;
  sessionDate?: string | null;
  sessionStartTime?: string | null;
  availableSpots: number;
  sessionStatus: string;
  bookLabel: string;
  audience: PublicPackageCategoryCardsAudience;
  className?: string;
  userBookingId?: string;
  bookingStateReady?: boolean;
  initialOnWaitlist?: boolean;
  onWaitlisted?: () => void;
  onWaitlistLeft?: () => void;
  onBooked?: (bookingId: string) => void;
  onCancelled?: () => void;
};

export function AuthAwareScheduleBookingAction({
  sessionId,
  sessionDate,
  sessionStartTime,
  availableSpots,
  sessionStatus,
  bookLabel,
  audience,
  className = SCHEDULE_BOOK_BTN,
  userBookingId,
  bookingStateReady = true,
  initialOnWaitlist = false,
  onWaitlisted,
  onWaitlistLeft,
  onBooked,
  onCancelled,
}: AuthAwareScheduleBookingActionProps) {
  const router = useRouter();
  const tBook = useTranslations("forms.bookSession");
  const tWaitlist = useTranslations("forms.joinWaitlist");
  const tLeaveWaitlist = useTranslations("forms.leaveWaitlist");
  const tSchedule = useTranslations("marketingPages.schedule");
  const tClasses = useTranslations("userPages.classes");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cancelMsg, setCancelMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [bookingId, setBookingId] = useState<string | undefined>(userBookingId);
  const [onWaitlist, setOnWaitlist] = useState(initialOnWaitlist);
  const [prevUserBookingId, setPrevUserBookingId] = useState(userBookingId);
  const [prevInitialOnWaitlist, setPrevInitialOnWaitlist] = useState(initialOnWaitlist);

  if (userBookingId !== prevUserBookingId) {
    setPrevUserBookingId(userBookingId);
    setBookingId(userBookingId);
  }
  if (initialOnWaitlist !== prevInitialOnWaitlist) {
    setPrevInitialOnWaitlist(initialOnWaitlist);
    setOnWaitlist(initialOnWaitlist);
  }

  const isFull = isScheduleSessionFull(availableSpots, sessionStatus);
  const resolvedBookingId = bookingId ?? userBookingId;
  const isBooked = resolvedBookingId !== undefined;
  const showOnWaitlist = !isBooked && (onWaitlist || initialOnWaitlist);

  function renderErrorHint(): ReactNode {
    if (!errorMsg) {
      return null;
    }
    return <p className="max-w-[12rem] text-right text-xs text-amber-900">{errorMsg}</p>;
  }

  function renderBookedActions(): ReactNode {
    if (resolvedBookingId === undefined) {
      return null;
    }

    return (
      <div className="flex flex-col items-end">
        {cancelMsg ? (
          <p className={`${CANCEL_BOOKING_ERROR_MESSAGE_CLASS} text-right`}>{cancelMsg}</p>
        ) : null}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <CancelBookingButton
            bookingId={resolvedBookingId}
            sessionDate={sessionDate}
            sessionStartTime={sessionStartTime}
            appearance="button"
            size="sm"
            buttonClassName={SCHEDULE_CANCEL_BTN}
            onError={setCancelMsg}
            onCancelled={() => {
              setBookingId(undefined);
              setCancelMsg(null);
              onCancelled?.();
            }}
          />
          <button
            type="button"
            disabled
            aria-disabled="true"
            className={SESSION_BOOKED_BUTTON_SM_CLASS}
          >
            {tClasses("bookedBadge")}
          </button>
        </div>
      </div>
    );
  }

  function renderAction(): ReactNode {
    if (audience === "guest") {
      return (
        <Link href={buildLoginHrefWithReturnUrl(SCHEDULE_RETURN_PATH)} className={className}>
          {bookLabel}
        </Link>
      );
    }

    if (isBooked) {
      return renderBookedActions();
    }

    if (!bookingStateReady) {
      return (
        <button
          type="button"
          className={className}
          disabled
          aria-busy="true"
          aria-label={tSchedule("actionLoading")}
        >
          {tSchedule("actionLoading")}
        </button>
      );
    }

    if (showOnWaitlist) {
      return (
        <button
          type="button"
          className={SCHEDULE_CANCEL_BTN}
          disabled={busy}
          onClick={() => void leaveWaitlist()}
        >
          {tLeaveWaitlist("action")}
        </button>
      );
    }

    return (
      <button
        type="button"
        className={className}
        disabled={busy}
        onClick={() => void (isFull ? joinWaitlist() : bookSession())}
      >
        {isFull ? tWaitlist("action") : bookLabel}
      </button>
    );
  }

  async function bookSession() {
    setBusy(true);
    setErrorMsg(null);
    try {
      const booking = await apiFetch<BookSessionResponse>(`/bookings/sessions/${sessionId}`, {
        method: "POST",
      });
      setBookingId(booking.id);
      onBooked?.(booking.id);
      dispatchNotificationsRefresh();
      router.refresh();
    } catch (error) {
      setErrorMsg(error instanceof ApiError ? error.message : tBook("bookFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function leaveWaitlist() {
    setBusy(true);
    setErrorMsg(null);
    try {
      await apiFetch(`/waitlist/sessions/${sessionId}`, { method: "DELETE" });
      setOnWaitlist(false);
      setSuccessToast(tLeaveWaitlist("success"));
      onWaitlistLeft?.();
      dispatchNotificationsRefresh();
    } catch (error) {
      setErrorMsg(error instanceof ApiError ? error.message : tLeaveWaitlist("failed"));
    } finally {
      setBusy(false);
    }
  }

  async function joinWaitlist() {
    setBusy(true);
    setErrorMsg(null);
    try {
      await apiFetch(`/waitlist/sessions/${sessionId}`, { method: "POST" });
      setOnWaitlist(true);
      setSuccessToast(tWaitlist("success"));
      onWaitlisted?.();
      dispatchNotificationsRefresh();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : tWaitlist("failed");
      if (error instanceof ApiError && error.message.toLowerCase().includes("already on waitlist")) {
        setOnWaitlist(true);
        setSuccessToast(tWaitlist("alreadyOnWaitlist"));
      } else {
        setErrorMsg(message);
      }
    } finally {
      setBusy(false);
    }
  }

  const showErrorBelowAction = audience !== "guest" && !isBooked && bookingStateReady;

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        {renderAction()}
        {showErrorBelowAction ? renderErrorHint() : null}
      </div>
      <OmmmCenterToast
        message={successToast}
        tone="success"
        onDismiss={() => setSuccessToast(null)}
      />
    </>
  );
}
