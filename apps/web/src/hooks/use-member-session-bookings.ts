"use client";

import { useEffect, useSyncExternalStore } from "react";
import { apiFetch } from "@/lib/api";
import {
  getMarketingSessionBookingsClientSnapshot,
  getMarketingSessionBookingsServerSnapshot,
  MARKETING_SESSION_BOOKINGS_UPDATED,
  writeCachedMarketingSessionBookings,
} from "@/lib/marketing-session-bookings-cache";
import { readCachedMarketingHeaderAccount } from "@/lib/marketing-header-account-cache";
import { marketingAudienceFromHeaderHref } from "@/lib/marketing-audience-from-header-href";
import type { UserBookingRow } from "@/lib/user-booking-types";
import {
  buildUserSessionBookingMap,
  type UserSessionBookingMap,
} from "@/lib/user-session-bookings-map";

function isMemberFromHeaderCache(): boolean {
  const cached = readCachedMarketingHeaderAccount();
  if (cached === null) {
    return false;
  }
  return marketingAudienceFromHeaderHref(cached.href) === "member";
}

function subscribeSessionBookings(onStoreChange: () => void): () => void {
  const handler = () => {
    onStoreChange();
  };
  window.addEventListener(MARKETING_SESSION_BOOKINGS_UPDATED, handler);
  return () => {
    window.removeEventListener(MARKETING_SESSION_BOOKINGS_UPDATED, handler);
  };
}

/** Hydration-safe cached bookings; refreshes in background for members. */
export function useMemberSessionBookings(): UserSessionBookingMap {
  const sessionBookings = useSyncExternalStore(
    subscribeSessionBookings,
    getMarketingSessionBookingsClientSnapshot,
    getMarketingSessionBookingsServerSnapshot,
  );

  useEffect(() => {
    if (!isMemberFromHeaderCache()) {
      return undefined;
    }

    let cancelled = false;

    void apiFetch<UserBookingRow[]>("/bookings/me")
      .then((bookings) => {
        if (cancelled) {
          return;
        }
        const next = buildUserSessionBookingMap(bookings);
        writeCachedMarketingSessionBookings(next);
      })
      .catch(() => {
        // Keep cached snapshot when offline or session expired.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return sessionBookings;
}
