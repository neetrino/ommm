"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, type ReactNode } from "react";
import {
  CancelBookingButton,
  CANCEL_BOOKING_ERROR_MESSAGE_CLASS,
} from "@/components/account/cancel-booking-button";
import { useSessionBooking } from "@/hooks/use-session-booking";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import {
  SCHEDULE_BOOK_BTN,
  SCHEDULE_BOOKED_BTN,
  SCHEDULE_BOOK_ACTION_GROUP_CENTERED,
  SCHEDULE_BOOK_ACTION_GROUP_STACKED,
  SCHEDULE_BOOK_ACTION_INLINE_WRAP,
  SCHEDULE_CANCEL_BTN,
} from "@/components/marketing/schedule/schedule-public-design";
import { useRouter } from "@/i18n/navigation";
import { OmmmCenterToast } from "@/components/ui/ommm-center-toast";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { buildLoginHrefWithReturnUrl } from "@/lib/auth-redirect";
import { ApiError, apiFetch } from "@/lib/api";
import { dispatchNotificationsRefresh } from "@/lib/notifications-refresh-event";
import { dispatchPackagesRefresh } from "@/lib/packages-refresh-event";
import { isScheduleSessionFull } from "@/lib/schedule-session-spots";

const DEFAULT_LOGIN_RETURN_PATH = "/schedule";

type AuthAwareScheduleBookingActionProps = {
  sessionId: string;
  sessionDate?: string | null;
  sessionStartTime?: string | null;
  availableSpots: number;
  sessionStatus: string;
  bookLabel: string;
  audience: PublicPackageCategoryCardsAudience;
  className?: string;
  /** Overrides booked badge styles (e.g. compact week cards). */
  bookedClassName?: string;
  /** Overrides cancel button styles (e.g. compact week cards). */
  cancelClassName?: string;
  userBookingId?: string;
  userBookingCreatedAt?: string;
  bookingStateReady?: boolean;
  initialOnWaitlist?: boolean;
  /** Post-login destination for guest booking intents (locale-free path). */
  loginReturnPath?: string;
  onWaitlisted?: () => void;
  onWaitlistLeft?: () => void;
  onBooked?: (bookingId: string) => void;
  onCancelled?: () => void;
  /** Hides the Booked pill in the action area (e.g. mobile header slot). */
  hideInlineBookedBadge?: boolean;
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
  bookedClassName = SCHEDULE_BOOKED_BTN,
  cancelClassName = SCHEDULE_CANCEL_BTN,
  userBookingId,
  userBookingCreatedAt,
  bookingStateReady = true,
  initialOnWaitlist = false,
  loginReturnPath = DEFAULT_LOGIN_RETURN_PATH,
  onWaitlisted,
  onWaitlistLeft,
  onBooked,
  onCancelled,
  hideInlineBookedBadge = false,
}: AuthAwareScheduleBookingActionProps) {
  const router = useRouter();
  const locale = useLocale();
  const tWaitlist = useTranslations("forms.joinWaitlist");
  const tLeaveWaitlist = useTranslations("forms.leaveWaitlist");
  const tSchedule = useTranslations("marketingPages.schedule");
  const tClasses = useTranslations("userPages.classes");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cancelMsg, setCancelMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [busyWaitlist, setBusyWaitlist] = useState(false);
  const [pendingLeaveWaitlist, setPendingLeaveWaitlist] = useState(false);
  const { busy: busyBooking, initiateBooking, packageModal } = useSessionBooking({
    sessionId,
    locale,
    onBooked: (bookingId) => {
      setBookingId(bookingId);
      setBookedAtIso(new Date().toISOString());
      onBooked?.(bookingId);
      dispatchNotificationsRefresh();
      dispatchPackagesRefresh();
      router.refresh();
    },
    onError: (message) => {
      setErrorMsg(message);
    },
  });
  const busy = busyBooking || busyWaitlist;
  const [bookingId, setBookingId] = useState<string | undefined>(userBookingId);
  const [bookedAtIso, setBookedAtIso] = useState<string | undefined>(undefined);
  const [onWaitlist, setOnWaitlist] = useState(initialOnWaitlist);
  const [prevUserBookingId, setPrevUserBookingId] = useState(userBookingId);
  const [prevInitialOnWaitlist, setPrevInitialOnWaitlist] = useState(initialOnWaitlist);

  if (userBookingId !== prevUserBookingId) {
    setPrevUserBookingId(userBookingId);
    setBookingId(userBookingId);
    if (userBookingId === undefined) {
      setBookedAtIso(undefined);
    }
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

    if (hideInlineBookedBadge) {
      return (
        <>
          {cancelMsg ? (
            <p className={`${CANCEL_BOOKING_ERROR_MESSAGE_CLASS} text-right`}>{cancelMsg}</p>
          ) : null}
          <CancelBookingButton
            bookingId={resolvedBookingId}
            sessionDate={sessionDate}
            sessionStartTime={sessionStartTime}
            bookedAt={bookedAtIso ?? userBookingCreatedAt}
            appearance="button"
            size="sm"
            buttonClassName={cancelClassName}
            wrapperClassName="flex flex-col items-end gap-1"
            onError={setCancelMsg}
            onCancelled={() => {
              setBookingId(undefined);
              setBookedAtIso(undefined);
              setCancelMsg(null);
              onCancelled?.();
            }}
          />
        </>
      );
    }

    return (
      <div className="flex w-full flex-col items-center">
        {cancelMsg ? (
          <p className={`${CANCEL_BOOKING_ERROR_MESSAGE_CLASS} text-center`}>{cancelMsg}</p>
        ) : null}
        <div
          className={
            locale === "ru" || locale === "hy"
              ? SCHEDULE_BOOK_ACTION_GROUP_STACKED
              : SCHEDULE_BOOK_ACTION_GROUP_CENTERED
          }
        >
          <CancelBookingButton
            bookingId={resolvedBookingId}
            sessionDate={sessionDate}
            sessionStartTime={sessionStartTime}
            bookedAt={bookedAtIso ?? userBookingCreatedAt}
            appearance="button"
            size="sm"
            buttonClassName={cancelClassName}
            wrapperClassName={SCHEDULE_BOOK_ACTION_INLINE_WRAP}
            onError={setCancelMsg}
            onCancelled={() => {
              setBookingId(undefined);
              setBookedAtIso(undefined);
              setCancelMsg(null);
              onCancelled?.();
            }}
          />
          <button
            type="button"
            disabled
            aria-disabled="true"
            className={bookedClassName}
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
        <button
          type="button"
          className={className}
          onClick={() => {
            router.push(buildLoginHrefWithReturnUrl(loginReturnPath));
          }}
        >
          {bookLabel}
        </button>
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
          className={className}
          disabled={busy}
          onClick={() => setPendingLeaveWaitlist(true)}
        >
          {tLeaveWaitlist("action")}
        </button>
      );
    }

    if (isFull) {
      return (
        <button
          type="button"
          className={className}
          disabled={busy}
          onClick={() => void joinWaitlist()}
        >
          {tWaitlist("action")}
        </button>
      );
    }

    return (
      <button
        type="button"
        className={className}
        disabled={busy}
        onClick={() => {
          setErrorMsg(null);
          void initiateBooking();
        }}
      >
        {bookLabel}
      </button>
    );
  }

  async function leaveWaitlist() {
    setBusyWaitlist(true);
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
      setBusyWaitlist(false);
      setPendingLeaveWaitlist(false);
    }
  }

  async function joinWaitlist() {
    setBusyWaitlist(true);
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
      setBusyWaitlist(false);
    }
  }

  const showErrorBelowAction = audience !== "guest" && !isBooked && bookingStateReady;
  const actionShellClass = isBooked
    ? hideInlineBookedBadge
      ? "flex flex-col items-end gap-1 self-end"
      : "flex w-full flex-col items-center gap-1"
    : "flex flex-col items-end gap-1 self-end";

  return (
    <>
      <div className={actionShellClass}>
        {renderAction()}
        {showErrorBelowAction ? renderErrorHint() : null}
      </div>
      <OmmmCenterToast
        message={successToast}
        tone="success"
        onDismiss={() => setSuccessToast(null)}
      />
      {packageModal}
      <OmmConfirmDialog
        isOpen={pendingLeaveWaitlist}
        title={tLeaveWaitlist("confirmTitle")}
        description={tLeaveWaitlist("confirmDescription")}
        confirmLabel={busyWaitlist ? tLeaveWaitlist("action") : tLeaveWaitlist("confirmLeave")}
        cancelLabel={tLeaveWaitlist("confirmCancel")}
        backdropAriaLabel={tLeaveWaitlist("confirmBackdrop")}
        tone="warm"
        pending={busyWaitlist}
        forceCenteredModal
        onConfirm={() => {
          void leaveWaitlist();
        }}
        onCancel={() => {
          if (!busyWaitlist) {
            setPendingLeaveWaitlist(false);
          }
        }}
      />
    </>
  );
}
