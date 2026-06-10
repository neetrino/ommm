"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { CancelBookingButton, CANCEL_BOOKING_ERROR_MESSAGE_CLASS } from "@/components/account/cancel-booking-button";
import { SESSION_BOOKED_BUTTON_MD_CLASS } from "@/components/account/session-booked-badge";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import { SCHEDULE_BOOK_BTN } from "@/components/marketing/schedule/schedule-public-design";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { buildLoginHrefWithReturnUrl } from "@/lib/auth-redirect";
import {
  readCachedMarketingSessionBookings,
  writeCachedMarketingSessionBookings,
} from "@/lib/marketing-session-bookings-cache";

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
  userBookingId?: string;
  className?: string;
};

export function AuthAwareScheduleBookingAction({
  sessionId,
  availableSpots,
  sessionStatus,
  bookLabel,
  audience,
  userBookingId,
  className = SCHEDULE_BOOK_BTN,
}: AuthAwareScheduleBookingActionProps) {
  const router = useRouter();
  const tBook = useTranslations("forms.bookSession");
  const tWaitlist = useTranslations("forms.joinWaitlist");
  const tClasses = useTranslations("userPages.classes");
  const [msg, setMsg] = useState<string | null>(null);
  const [cancelMsg, setCancelMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [bookingId, setBookingId] = useState<string | undefined>(userBookingId);
  const [prevUserBookingId, setPrevUserBookingId] = useState(userBookingId);
  if (userBookingId !== prevUserBookingId) {
    setPrevUserBookingId(userBookingId);
    setBookingId(userBookingId);
  }

  const isFull = sessionStatus === "FULL" || availableSpots <= 0;
  const isGuest = audience === "guest" && userBookingId === undefined;

  async function bookSession() {
    setBusy(true);
    setMsg(null);
    try {
      const booking = await apiFetch<BookSessionResponse>(
        `/bookings/sessions/${sessionId}`,
        { method: "POST" },
      );
      setBookingId(booking.id);
      writeCachedMarketingSessionBookings({
        ...readCachedMarketingSessionBookings(),
        [sessionId]: booking.id,
      });
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
      router.refresh();
    } catch (error) {
      setMsg(error instanceof ApiError ? error.message : tWaitlist("failed"));
    } finally {
      setBusy(false);
    }
  }

  async function handlePrimaryAction() {
    if (isGuest) {
      router.push(buildLoginHrefWithReturnUrl(SCHEDULE_RETURN_PATH));
      return;
    }
    if (isFull) {
      await joinWaitlist();
      return;
    }
    await bookSession();
  }

  if (bookingId) {
    return (
      <div className="flex flex-col items-end">
        {cancelMsg ? (
          <p className={`${CANCEL_BOOKING_ERROR_MESSAGE_CLASS} text-right`}>{cancelMsg}</p>
        ) : null}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <CancelBookingButton
            bookingId={bookingId}
            appearance="button"
            size="md"
            onError={setCancelMsg}
            onCancelled={() => {
              setBookingId(undefined);
              setCancelMsg(null);
              const cached = readCachedMarketingSessionBookings();
              if (sessionId in cached) {
                const next = { ...cached };
                delete next[sessionId];
                writeCachedMarketingSessionBookings(next);
              }
            }}
          />
          <button
            type="button"
            disabled
            aria-disabled="true"
            className={SESSION_BOOKED_BUTTON_MD_CLASS}
          >
            {tClasses("bookedBadge")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        className={className}
        disabled={busy}
        onClick={() => void handlePrimaryAction()}
      >
        {isFull && !isGuest ? tWaitlist("action") : bookLabel}
      </button>
      {msg ? <p className="max-w-[12rem] text-right text-xs text-amber-900">{msg}</p> : null}
    </div>
  );
}
