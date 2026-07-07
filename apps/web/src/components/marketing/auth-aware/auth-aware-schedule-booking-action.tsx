"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRef, useState, type ReactNode } from "react";
import {
  CancelBookingButton,
  CANCEL_BOOKING_ERROR_MESSAGE_CLASS,
} from "@/components/account/cancel-booking-button";
import { useSessionBooking } from "@/hooks/use-session-booking";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import {
  SCHEDULE_BOOK_BTN,
  SCHEDULE_BOOKED_BTN,
  SCHEDULE_BOOK_ACTION_GROUP,
  SCHEDULE_CANCEL_BTN,
} from "@/components/marketing/schedule/schedule-public-design";
import { useRouter } from "@/i18n/navigation";
import { OmmmCenterToast } from "@/components/ui/ommm-center-toast";
import { buildLoginHrefWithReturnUrl } from "@/lib/auth-redirect";
import { ApiError, apiFetch } from "@/lib/api";
import { dispatchNotificationsRefresh } from "@/lib/notifications-refresh-event";
import { isScheduleSessionFull } from "@/lib/schedule-session-spots";
import { ScheduleBookSplashModal } from "@/components/marketing/schedule/schedule-book-splash-modal";

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
  userBookingId?: string;
  bookingStateReady?: boolean;
  initialOnWaitlist?: boolean;
  /** Post-login destination for guest booking intents (locale-free path). */
  loginReturnPath?: string;
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
  loginReturnPath = DEFAULT_LOGIN_RETURN_PATH,
  onWaitlisted,
  onWaitlistLeft,
  onBooked,
  onCancelled,
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
  const [bookSplashOpen, setBookSplashOpen] = useState(false);
  const [bookSplashVariant, setBookSplashVariant] = useState<"member" | "guest">("member");
  const pendingBookActionRef = useRef<(() => void) | null>(null);
  const [busyWaitlist, setBusyWaitlist] = useState(false);
  const {
    busy: busyBooking,
    initiateBooking,
    packageModal,
    packageModalOpen,
    purchaseModalOpen,
  } = useSessionBooking({
    sessionId,
    locale,
    onBooked: (bookingId) => {
      setBookingId(bookingId);
      onBooked?.(bookingId);
      dispatchNotificationsRefresh();
      router.refresh();
    },
    onError: (message) => {
      setErrorMsg(message);
      setBookSplashOpen(false);
    },
  });
  const busy = busyBooking || busyWaitlist;
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
  const overlayModalOpen = packageModalOpen || purchaseModalOpen;
  const [prevOverlayModalOpen, setPrevOverlayModalOpen] = useState(overlayModalOpen);

  if (overlayModalOpen !== prevOverlayModalOpen) {
    setPrevOverlayModalOpen(overlayModalOpen);
    if (overlayModalOpen && bookSplashOpen) {
      setBookSplashOpen(false);
    }
  }

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
        <div className={SCHEDULE_BOOK_ACTION_GROUP}>
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
            className={SCHEDULE_BOOKED_BTN}
          >
            {tClasses("bookedBadge")}
          </button>
        </div>
      </div>
    );
  }

  function openGuestBookSplash(): void {
    pendingBookActionRef.current = () => {
      router.push(buildLoginHrefWithReturnUrl(loginReturnPath));
    };
    setBookSplashVariant("guest");
    setBookSplashOpen(true);
  }

  function openMemberBookSplash(): void {
    pendingBookActionRef.current = null;
    setBookSplashVariant("member");
    setBookSplashOpen(true);
    void initiateBooking();
  }

  function handleBookSplashDismiss(): void {
    setBookSplashOpen(false);
    const action = pendingBookActionRef.current;
    pendingBookActionRef.current = null;
    action?.();
  }

  function renderAction(): ReactNode {
    if (audience === "guest") {
      return (
        <button
          type="button"
          className={className}
          onClick={openGuestBookSplash}
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
          className={SCHEDULE_CANCEL_BTN}
          disabled={busy}
          onClick={() => void leaveWaitlist()}
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
        disabled={busy || bookSplashOpen}
        onClick={openMemberBookSplash}
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
      {packageModal}
      <ScheduleBookSplashModal
        isOpen={bookSplashOpen}
        variant={bookSplashVariant}
        onDismiss={handleBookSplashDismiss}
      />
    </>
  );
}
