"use client";

import { useEffect, useState } from "react";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import { apiFetch } from "@/lib/api";
import type { UserBookingRow } from "@/lib/user-booking-types";
import {
  buildUserSessionBookingMap,
  type UserSessionBookingMap,
} from "@/lib/user-session-bookings-map";

/** Loads upcoming member bookings after paint — keeps public schedule SSR fast. */
export function useMemberSessionBookings(
  audience: PublicPackageCategoryCardsAudience,
): UserSessionBookingMap {
  const [sessionBookings, setSessionBookings] = useState<UserSessionBookingMap>({});

  useEffect(() => {
    if (audience !== "member") {
      return undefined;
    }

    let cancelled = false;

    void apiFetch<UserBookingRow[]>("/bookings/me")
      .then((bookings) => {
        if (!cancelled) {
          setSessionBookings(buildUserSessionBookingMap(bookings));
        }
      })
      .catch(() => {
        // Non-blocking — rows keep default Book actions.
      });

    return () => {
      cancelled = true;
    };
  }, [audience]);

  return sessionBookings;
}
