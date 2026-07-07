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
import { useMemberWaitlistData } from "@/hooks/use-member-waitlist-data";
import type { MarketingScheduleItem } from "@/components/marketing/schedule/marketing-schedule-types";
import { SCHEDULE_CLOCK_TICK_MS } from "@/lib/public-schedule-constants";
import { REALTIME_REFETCH_KEYS } from "@/lib/realtime/realtime-refetch-keys";

type UseMarketingScheduleMemberStateOptions = {
  isMember: boolean;
  initialItems: MarketingScheduleItem[];
};

export function useMarketingScheduleMemberState({
  isMember,
  initialItems,
}: UseMarketingScheduleMemberStateOptions) {
  const [items, setItems] = useState<MarketingScheduleItem[]>(initialItems);
  const [sessionsReady, setSessionsReady] = useState(initialItems.length > 0);
  const [bookedBySessionId, setBookedBySessionId] = useState<Record<string, string>>({});
  const [memberBookingsLoaded, setMemberBookingsLoaded] = useState(!isMember);
  const [scheduleNow, setScheduleNow] = useState(() => new Date());
  const bookedBySessionIdRef = useRef(bookedBySessionId);

  useEffect(() => {
    bookedBySessionIdRef.current = bookedBySessionId;
  }, [bookedBySessionId]);

  const { waitlistedSessionIds, loaded: memberWaitlistLoaded, refetch: refetchWaitlist } =
    useMemberWaitlistData(isMember);
  const memberActionStateReady =
    !isMember || (memberBookingsLoaded && memberWaitlistLoaded);

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
        const next: Record<string, string> = {};
        for (const row of rows) {
          if (row.status === "BOOKED") {
            next[row.session.id] = row.id;
          }
        }
        setBookedBySessionId(next);
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
    let cancelled = false;
    void refetchMemberBookings(true, () => !cancelled);
    return () => {
      cancelled = true;
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
    let cancelled = false;

    const runRefresh = (): void => {
      if (!cancelled) {
        void refreshSchedule();
      }
    };

    if (initialItems.length > 0) {
      let idleCallbackId: number | undefined;
      let timeoutId: number | undefined;

      if (typeof requestIdleCallback !== "undefined") {
        idleCallbackId = requestIdleCallback(runRefresh, { timeout: 2_000 });
      } else {
        timeoutId = window.setTimeout(runRefresh, 300);
      }

      return () => {
        cancelled = true;
        if (idleCallbackId !== undefined) {
          cancelIdleCallback(idleCallbackId);
        }
        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId);
        }
      };
    }

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
  useRealtimeRefetch(
    REALTIME_REFETCH_KEYS.WAITLIST_ME,
    () => refetchWaitlist({ silent: true }),
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
      if (document.visibilityState !== "visible") {
        return;
      }
      intervalId = window.setInterval(tick, SCHEDULE_CLOCK_TICK_MS);
    };

    armInterval();

    const onVisibility = (): void => {
      if (document.visibilityState === "visible") {
        tick();
        armInterval();
        return;
      }
      clearIntervalIfSet();
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearIntervalIfSet();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const handleBooked = useCallback(
    (sessionId: string, bookingId: string) => {
      setBookedBySessionId((current) => ({ ...current, [sessionId]: bookingId }));
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
