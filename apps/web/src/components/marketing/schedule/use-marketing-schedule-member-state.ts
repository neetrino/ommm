"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { fetchPublicScheduleClient } from "@/lib/fetch-public-schedule-client";
import { useDebouncedCallback } from "@/lib/debounced-callback";
import {
  dispatchNotificationsRefresh,
  NOTIFICATIONS_REFRESH_EVENT,
} from "@/lib/notifications-refresh-event";
import { dispatchPackagesRefresh } from "@/lib/packages-refresh-event";
import { useScheduleLiveSync } from "@/hooks/use-schedule-live-sync";
import { useRealtimeRefetch } from "@/hooks/use-realtime-refetch";
import {
  applyScheduleSpotDelta,
  mergePublicScheduleItems,
} from "@/lib/schedule-session-spots";
import type { UserBookingRow } from "@/lib/user-booking-types";
import type {
  UserSessionBookingMap,
  UserSessionBookingRef,
} from "@/lib/user-session-bookings-map";
import {
  readCachedMarketingSessionBookings,
  writeCachedMarketingSessionBookings,
} from "@/lib/marketing-session-bookings-cache";
import { useMemberWaitlistData } from "@/hooks/use-member-waitlist-data";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { SCHEDULE_CLOCK_TICK_MS } from "@/lib/public-schedule-constants";
import { REALTIME_REFETCH_KEYS } from "@/lib/realtime/realtime-refetch-keys";

type UseMarketingScheduleMemberStateOptions = {
  isMember: boolean;
  initialItems: readonly MarketingScheduleItem[];
};

export function useMarketingScheduleMemberState({
  isMember,
  initialItems,
}: UseMarketingScheduleMemberStateOptions) {
  const [items, setItems] = useState<MarketingScheduleItem[]>(() => [...initialItems]);
  const [sessionsReady, setSessionsReady] = useState(initialItems.length > 0);
  const [bookedBySessionId, setBookedBySessionId] = useState<UserSessionBookingMap>(() =>
    isMember ? readCachedMarketingSessionBookings() : {},
  );
  const [memberBookingsLoaded, setMemberBookingsLoaded] = useState(true);
  const [scheduleNow, setScheduleNow] = useState(() => new Date());
  const bookedBySessionIdRef = useRef(bookedBySessionId);

  useEffect(() => {
    bookedBySessionIdRef.current = bookedBySessionId;
  }, [bookedBySessionId]);

  const { waitlistedSessionIds, loaded: memberWaitlistLoaded, refetch: refetchWaitlist } =
    useMemberWaitlistData(isMember);

  // Do not block CTAs on waitlist — only bookings matter for Book vs Booked.
  const memberActionStateReady = !isMember || memberBookingsLoaded;

  const refetchMemberBookings = useCallback(
    async (markLoaded: boolean, isActive: () => boolean = () => true) => {
      if (!isMember) {
        if (!isActive()) {
          return;
        }
        setMemberBookingsLoaded(true);
        setBookedBySessionId((current) =>
          Object.keys(current).length === 0 ? current : {},
        );
        return;
      }
      try {
        const rows = await apiFetch<UserBookingRow[]>("/bookings/me");
        if (!isActive()) {
          return;
        }
        const next: Record<string, UserSessionBookingRef> = {};
        for (const row of rows) {
          if (row.status === "BOOKED") {
            next[row.session.id] = {
              bookingId: row.id,
              createdAt: row.createdAt ?? null,
            };
          }
        }
        setBookedBySessionId(next);
        writeCachedMarketingSessionBookings(next);
      } catch {
        // Keep the previous map on transient load errors.
      } finally {
        if (markLoaded && isActive()) {
          setMemberBookingsLoaded(true);
        }
      }
    },
    [isMember],
  );

  useEffect(() => {
    if (!isMember) {
      setBookedBySessionId({});
      setMemberBookingsLoaded(true);
      return;
    }
    setBookedBySessionId(readCachedMarketingSessionBookings());
    setMemberBookingsLoaded(true);
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        void refetchMemberBookings(true, () => !cancelled);
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [isMember, refetchMemberBookings]);

  const refreshSchedule = useCallback(async () => {
    try {
      const { items: nextItems } = await fetchPublicScheduleClient();
      setItems((current) =>
        mergePublicScheduleItems(current, nextItems, bookedBySessionIdRef.current),
      );
    } catch {
      // Keep current list when refresh fails.
    } finally {
      setSessionsReady(true);
    }
  }, []);

  useEffect(() => {
    if (initialItems.length > 0) {
      return;
    }

    let cancelled = false;
    const runRefresh = (): void => {
      if (!cancelled) {
        void refreshSchedule();
      }
    };

    runRefresh();
    return () => {
      cancelled = true;
    };
  }, [initialItems.length, refreshSchedule]);

  const syncLiveSchedule = useCallback(() => {
    setScheduleNow(new Date());
    void refreshSchedule();
  }, [refreshSchedule]);

  useRealtimeRefetch(REALTIME_REFETCH_KEYS.SCHEDULE_PUBLIC, refreshSchedule);
  useRealtimeRefetch(
    REALTIME_REFETCH_KEYS.BOOKINGS_ME,
    () => refetchMemberBookings(false),
    isMember,
  );
  useScheduleLiveSync({ onSync: syncLiveSchedule });

  const debouncedRefetchBookings = useDebouncedCallback(() => {
    void refetchMemberBookings(false);
  }, 400);

  useEffect(() => {
    if (!isMember) {
      return undefined;
    }
    const handleRefresh = (): void => {
      debouncedRefetchBookings();
    };
    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, handleRefresh);
    };
  }, [debouncedRefetchBookings, isMember]);

  useEffect(() => {
    let intervalId: number | undefined;

    const tick = (): void => {
      setScheduleNow(new Date());
    };

    const clearIntervalIfSet = (): void => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const armInterval = (): void => {
      clearIntervalIfSet();
      if (document.visibilityState === "visible") {
        intervalId = window.setInterval(tick, SCHEDULE_CLOCK_TICK_MS);
      }
    };

    const onVisibility = (): void => {
      if (document.visibilityState === "visible") {
        tick();
        armInterval();
      } else {
        clearIntervalIfSet();
      }
    };

    armInterval();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearIntervalIfSet();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const handleBooked = useCallback(
    (sessionId: string, bookingId: string) => {
      setBookedBySessionId((current) => {
        const next = {
          ...current,
          [sessionId]: {
            bookingId,
            createdAt: new Date().toISOString(),
          },
        };
        writeCachedMarketingSessionBookings(next);
        return next;
      });
      setItems((current) =>
        current.map((item) =>
          item.id === sessionId ? applyScheduleSpotDelta(item, -1) : item,
        ),
      );
      void refreshSchedule();
      dispatchNotificationsRefresh();
      dispatchPackagesRefresh();
    },
    [refreshSchedule],
  );

  const handleCancelled = useCallback(
    async (sessionId: string) => {
      setBookedBySessionId((current) => {
        const next = { ...current };
        delete next[sessionId];
        writeCachedMarketingSessionBookings(next);
        return next;
      });
      await refreshSchedule();
      dispatchNotificationsRefresh();
    },
    [refreshSchedule],
  );

  const handleWaitlisted = useCallback(() => {
    void refetchWaitlist({ silent: true });
  }, [refetchWaitlist]);

  const handleWaitlistLeft = useCallback(() => {
    void refetchWaitlist({ silent: true });
  }, [refetchWaitlist]);

  return {
    items,
    sessionsReady,
    bookedBySessionId,
    memberWaitlistLoaded,
    waitlistedSessionIds,
    memberActionStateReady,
    scheduleNow,
    handleBooked,
    handleCancelled,
    handleWaitlisted,
    handleWaitlistLeft,
  };
}
