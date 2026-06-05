"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
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
  priceCents: number;
  full: boolean;
  userBookingId?: string;
  size?: "sm" | "md";
  layout?: "board" | "list";
  onBookingChange?: (bookingId: string | undefined) => void;
};

export function SessionBookingActions({
  sessionId,
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

  useEffect(() => {
    setBookingId(userBookingId);
  }, [userBookingId]);

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
        appearance="button"
        size={size}
        onCancelled={() => {
          setBookingId(undefined);
          onBookingChange?.(undefined);
        }}
      />
    );

    return (
      <div className="flex flex-wrap items-center gap-2">
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
    return <JoinWaitlistButton sessionId={sessionId} size={size} />;
  }

  return (
    <BookSessionButton
      sessionId={sessionId}
      priceCents={priceCents}
      size={size}
      onBooked={(id) => {
        setBookingId(id);
        onBookingChange?.(id);
        router.refresh();
      }}
    />
  );
}
