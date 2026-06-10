"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { BookSessionButton } from "@/components/account/book-session-button";
import {
  SESSION_BOOKED_BUTTON_MD_CLASS,
  SESSION_BOOKED_BUTTON_SM_CLASS,
} from "@/components/account/session-booked-badge";
import { CancelBookingButton } from "@/components/account/cancel-booking-button";
import { JoinWaitlistButton } from "@/components/account/join-waitlist-button";

type SessionBookingActionsProps = {
  sessionId: string;
  sessionStartsAt?: string;
  priceCents: number;
  full: boolean;
  userBookingId?: string;
  size?: "sm" | "md";
  layout?: "board" | "list";
  onBookingChange?: (bookingId: string | undefined) => void;
};

export function SessionBookingActions({
  sessionId,
  sessionStartsAt,
  priceCents,
  full,
  userBookingId,
  size = "md",
  layout = "board",
  onBookingChange,
}: SessionBookingActionsProps) {
  const tClasses = useTranslations("userPages.classes");
  const router = useRouter();
  const [bookingId, setBookingId] = useState<string | undefined>(userBookingId);
  const [prevUserBookingId, setPrevUserBookingId] = useState(userBookingId);
  if (userBookingId !== prevUserBookingId) {
    setPrevUserBookingId(userBookingId);
    setBookingId(userBookingId);
  }

  if (bookingId) {
    const bookedButtonClass =
      size === "sm" ? SESSION_BOOKED_BUTTON_SM_CLASS : SESSION_BOOKED_BUTTON_MD_CLASS;

    const bookedButton = (
      <button
        type="button"
        disabled
        aria-disabled="true"
        className={bookedButtonClass}
      >
        {tClasses("bookedBadge")}
      </button>
    );

    const cancelButton = (
      <CancelBookingButton
        bookingId={bookingId}
        sessionStartsAt={sessionStartsAt}
        appearance="button"
        size={size}
        onCancelled={() => {
          setBookingId(undefined);
          onBookingChange?.(undefined);
        }}
      />
    );

    const actionsRowClass =
      layout === "list"
        ? "flex flex-wrap items-center justify-end gap-2"
        : "flex flex-wrap items-center gap-2";

    return (
      <div className={actionsRowClass}>
        {layout === "list" ? (
          <>
            {cancelButton}
            {bookedButton}
          </>
        ) : (
          <>
            {bookedButton}
            {cancelButton}
          </>
        )}
      </div>
    );
  }

  if (full) {
    const waitlistButton = <JoinWaitlistButton sessionId={sessionId} size={size} />;
    if (layout === "list") {
      return <div className="flex justify-end">{waitlistButton}</div>;
    }
    return waitlistButton;
  }

  return (
    <BookSessionButton
      sessionId={sessionId}
      priceCents={priceCents}
      size={size}
      layout={layout}
      onBooked={(id) => {
        setBookingId(id);
        onBookingChange?.(id);
        router.refresh();
      }}
    />
  );
}
