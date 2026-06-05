"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { BookSessionButton } from "@/components/account/book-session-button";
import { CancelBookingButton } from "@/components/account/cancel-booking-button";
import { JoinWaitlistButton } from "@/components/account/join-waitlist-button";
import { OmmButton } from "@/components/ui/omm-button";

type SessionBookingActionsProps = {
  sessionId: string;
  priceCents: number;
  full: boolean;
  userBookingId?: string;
  size?: "sm" | "md";
  onBookingChange?: (bookingId: string | undefined) => void;
};

export function SessionBookingActions({
  sessionId,
  priceCents,
  full,
  userBookingId,
  size = "md",
  onBookingChange,
}: SessionBookingActionsProps) {
  const t = useTranslations("forms.bookSession");
  const router = useRouter();
  const [bookingId, setBookingId] = useState<string | undefined>(userBookingId);

  useEffect(() => {
    setBookingId(userBookingId);
  }, [userBookingId]);

  if (bookingId) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <OmmButton type="button" variant="primary" size={size} disabled aria-disabled="true">
          {t("book")}
        </OmmButton>
        <CancelBookingButton
          bookingId={bookingId}
          appearance="button"
          size={size}
          onCancelled={() => {
            setBookingId(undefined);
            onBookingChange?.(undefined);
          }}
        />
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
