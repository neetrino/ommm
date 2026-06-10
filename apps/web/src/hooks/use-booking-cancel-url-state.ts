"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { BOOKING_CANCEL_QUERY_PARAM } from "@/lib/booking-cancel-url";

type UseBookingCancelUrlStateResult = {
  cancelBookingId: string | null;
  openCancelBooking: (bookingId: string) => void;
  closeCancelBooking: () => void;
};

/** Live query string — avoids stale `useSearchParams` snapshots after `router.refresh()`. */
function readLocationSearchParams(): URLSearchParams {
  if (typeof window === "undefined") {
    return new URLSearchParams();
  }
  return new URLSearchParams(window.location.search);
}

/** Syncs cancel-booking dialog state with `?cancelBooking=<id>` in the URL. */
export function useBookingCancelUrlState(): UseBookingCancelUrlStateResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const cancelBookingId = searchParams.get(BOOKING_CANCEL_QUERY_PARAM)?.trim() ?? null;

  const replaceCancelParam = useCallback(
    (bookingId: string | null) => {
      const params = readLocationSearchParams();
      if (bookingId !== null && bookingId.length > 0) {
        params.set(BOOKING_CANCEL_QUERY_PARAM, bookingId);
      } else {
        params.delete(BOOKING_CANCEL_QUERY_PARAM);
      }
      const query = params.toString();
      router.replace(query.length > 0 ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const openCancelBooking = useCallback(
    (bookingId: string) => {
      replaceCancelParam(bookingId);
    },
    [replaceCancelParam],
  );

  const closeCancelBooking = useCallback(() => {
    replaceCancelParam(null);
  }, [replaceCancelParam]);

  return {
    cancelBookingId,
    openCancelBooking,
    closeCancelBooking,
  };
}
