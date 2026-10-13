"use client";

import { useCallback, useState } from "react";
import { AuthAwareScheduleBookingAction } from "@/components/marketing/auth-aware/auth-aware-schedule-booking-action";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";

type ScheduleSessionDetailBookControlProps = {
  session: MarketingScheduleItem | null;
  actionSlot: HTMLElement | null;
  onCloseDetail: () => void;
  audience: PublicPackageCategoryCardsAudience;
  bookLabel: string;
  bookedClassName: string;
  bookClassName: string;
  cancelClassName: string;
  userBookingId?: string;
  userBookingCreatedAt?: string;
  bookingStateReady: boolean;
  isOnWaitlist: boolean;
  loginReturnPath: string;
  onBooked?: (sessionId: string, bookingId: string) => void;
  onCancelled?: (sessionId: string) => void;
  onWaitlisted?: (sessionId: string) => void;
  onWaitlistLeft?: (sessionId: string) => void;
};

function shouldReplaceHeldSession(
  held: MarketingScheduleItem | null,
  session: MarketingScheduleItem,
): boolean {
  if (held === null || held.id !== session.id) {
    return true;
  }
  return (
    held.availableSpots !== session.availableSpots ||
    held.status !== session.status ||
    held.startTime !== session.startTime ||
    held.sessionDate !== session.sessionDate
  );
}

/**
 * Keeps booking sheets mounted after the session detail modal closes.
 * The book control is portaled into the modal footer while that footer exists.
 */
export function ScheduleSessionDetailBookControl({
  session,
  onCloseDetail,
  ...actionProps
}: ScheduleSessionDetailBookControlProps) {
  const [held, setHeld] = useState<MarketingScheduleItem | null>(session);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (session !== null && !sheetOpen && shouldReplaceHeldSession(held, session)) {
    setHeld(session);
  }
  if (session === null && !sheetOpen && held !== null) {
    setHeld(null);
  }

  const handleSheetOpenChange = useCallback(
    (open: boolean): void => {
      setSheetOpen(open);
      if (open) {
        onCloseDetail();
      }
    },
    [onCloseDetail],
  );

  if (held === null) {
    return null;
  }

  return (
    <HeldDetailBookingAction
      {...actionProps}
      held={held}
      onBookingSheetOpenChange={handleSheetOpenChange}
    />
  );
}

function HeldDetailBookingAction({
  held,
  onBookingSheetOpenChange,
  onBooked,
  onCancelled,
  onWaitlisted,
  onWaitlistLeft,
  ...actionProps
}: Omit<ScheduleSessionDetailBookControlProps, "session" | "onCloseDetail"> & {
  held: MarketingScheduleItem;
  onBookingSheetOpenChange: (open: boolean) => void;
}) {
  return (
    <AuthAwareScheduleBookingAction
      key={held.id}
      sessionId={held.id}
      sessionDate={held.sessionDate}
      sessionStartTime={held.startTime}
      availableSpots={held.availableSpots}
      sessionStatus={held.status}
      actionSlot={actionProps.actionSlot}
      audience={actionProps.audience}
      bookLabel={actionProps.bookLabel}
      className={actionProps.bookClassName}
      bookedClassName={actionProps.bookedClassName}
      cancelClassName={actionProps.cancelClassName}
      userBookingId={actionProps.userBookingId}
      userBookingCreatedAt={actionProps.userBookingCreatedAt}
      bookingStateReady={actionProps.bookingStateReady}
      initialOnWaitlist={actionProps.isOnWaitlist}
      loginReturnPath={actionProps.loginReturnPath}
      onBookingSheetOpenChange={onBookingSheetOpenChange}
      onBooked={(bookingId) => onBooked?.(held.id, bookingId)}
      onCancelled={() => onCancelled?.(held.id)}
      onWaitlisted={() => onWaitlisted?.(held.id)}
      onWaitlistLeft={() => onWaitlistLeft?.(held.id)}
    />
  );
}
