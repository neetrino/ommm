"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { CancelBookingButton } from "@/components/account/cancel-booking-button";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import {
  SCHEDULE_BOOK_BTN,
  SCHEDULE_CANCEL_BTN,
} from "@/components/marketing/schedule/schedule-public-design";
import { Link, useRouter } from "@/i18n/navigation";
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
  availableSpots: number;
  sessionStatus: string;
  bookLabel: string;
  audience: PublicPackageCategoryCardsAudience;
  className?: string;
  userBookingId?: string;
  bookingStateReady?: boolean;
  initialOnWaitlist?: boolean;
  onWaitlisted?: () => void;
  onBooked?: (bookingId: string) => void;
  onCancelled?: () => void;
};

export function AuthAwareScheduleBookingAction({
  sessionId,
  availableSpots,
  sessionStatus,
  bookLabel,
  audience,
  className = SCHEDULE_BOOK_BTN,
  userBookingId,
  bookingStateReady = true,
  initialOnWaitlist = false,
  onWaitlisted,
  onBooked,
  onCancelled,
}: AuthAwareScheduleBookingActionProps) {
  const router = useRouter();
  const tBook = useTranslations("forms.bookSession");
  const tWaitlist = useTranslations("forms.joinWaitlist");
  const tSchedule = useTranslations("marketingPages.schedule");
  const [msg, setMsg] = useState<string | null>(null);
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

  if (audience === "guest") {
    return (
      <Link href={buildLoginHrefWithReturnUrl(SCHEDULE_RETURN_PATH)} className={className}>
        {bookLabel}
      </Link>
    );
  }

  if (isBooked) {
    return (
      <CancelBookingButton
        bookingId={resolvedBookingId}
        appearance="button"
        size="sm"
        buttonClassName={SCHEDULE_CANCEL_BTN}
        wrapperClassName="flex flex-col items-end gap-1"
        onCancelled={() => {
          setBookingId(undefined);
          onCancelled?.();
        }}
      />
    );
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
      <div className="flex flex-col items-end gap-1">
        <button type="button" className={className} disabled aria-disabled="true">
          {tSchedule("onWaitlistBadge")}
        </button>
        {msg ? <p className="max-w-[12rem] text-right text-xs text-sage-600">{msg}</p> : null}
      </div>
    );
  }

  async function bookSession() {
    setBusy(true);
    setMsg(null);
    try {
      const booking = await apiFetch<BookSessionResponse>(`/bookings/sessions/${sessionId}`, {
        method: "POST",
      });
      setBookingId(booking.id);
      onBooked?.(booking.id);
      dispatchNotificationsRefresh();
      router.refresh();
    } catch (error) {
      setMsg(error instanceof ApiError ? error.message : tBook("bookFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function joinWaitlist() {
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch(`/waitlist/sessions/${sessionId}`, { method: "POST" });
      setOnWaitlist(true);
      setMsg(tWaitlist("success"));
      onWaitlisted?.();
      dispatchNotificationsRefresh();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : tWaitlist("failed");
      if (error instanceof ApiError && error.message.toLowerCase().includes("already on waitlist")) {
        setOnWaitlist(true);
        setMsg(tWaitlist("alreadyOnWaitlist"));
      } else {
        setMsg(message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        className={className}
        disabled={busy}
        onClick={() => void (isFull ? joinWaitlist() : bookSession())}
      >
        {isFull ? tWaitlist("action") : bookLabel}
      </button>
      {msg ? (
        <p
          className={`max-w-[12rem] text-right text-xs ${onWaitlist ? "text-sage-600" : "text-amber-900"}`}
        >
          {msg}
        </p>
      ) : null}
    </div>
  );
}
