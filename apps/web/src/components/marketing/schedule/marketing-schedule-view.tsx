"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { fetchPublicScheduleClient } from "@/lib/fetch-public-schedule-client";
import { useDebouncedCallback } from "@/lib/debounced-callback";
import {
  dispatchNotificationsRefresh,
  NOTIFICATIONS_REFRESH_EVENT,
} from "@/lib/notifications-refresh-event";
import { useScheduleLiveSync } from "@/hooks/use-schedule-live-sync";
import { useRealtimeRefetch } from "@/hooks/use-realtime-refetch";
import {
  applyScheduleSpotDelta,
  mergePublicScheduleItems,
  resolveMemberOnWaitlistBadge,
  resolveMemberScheduleRowDisplay,
} from "@/lib/schedule-session-spots";
import type { UserBookingRow } from "@/lib/user-booking-types";
import { useMemberWaitlistData } from "@/hooks/use-member-waitlist-data";
import styles from "@/components/marketing/schedule/marketing-schedule-view.module.css";
import {
  SCHEDULE_DATE_STRIP_VISIBLE_DAYS,
  ScheduleDateControls,
} from "@/components/marketing/schedule/schedule-date-controls";
import {
  type ScheduleFilterOption,
} from "@/components/marketing/schedule/schedule-filter-dropdown";
import { ScheduleFiltersHeader } from "@/components/marketing/schedule/schedule-filters-header";
import { ScheduleSessionRow } from "@/components/marketing/schedule/schedule-session-row";
import { SCHEDULE_MUTED } from "@/components/marketing/schedule/schedule-public-design";
import {
  addDays,
  compareCalendarDays,
  isBeforeCalendarDay,
  isSameCalendarDay,
  startOfLocalDay,
  startOfWeekSunday,
} from "@/components/marketing/schedule/schedule-date-utils";
import {
  type MarketingScheduleItem,
  type MarketingScheduleDayOfWeek,
} from "@/components/marketing/schedule/marketing-schedule-types";
import {
  useScheduleDayTransition,
} from "@/components/marketing/schedule/use-schedule-day-transition";
import { isUpcomingPublicScheduleSession } from "@/lib/filter-public-schedule-items";
import { SCHEDULE_CLOCK_TICK_MS } from "@/lib/public-schedule-constants";
import { REALTIME_REFETCH_KEYS } from "@/lib/realtime/realtime-refetch-keys";
import { formatScheduleTimeHHmm } from "@/lib/format-time-display";
import { getScheduleClassTypeValues } from "@/lib/schedule-class-types";
import { useMarketingAudience } from "@/hooks/use-marketing-audience";
import { MarketingScheduleSessionsSkeleton } from "@/components/marketing/schedule/marketing-schedule-sessions-skeleton";

type ScheduleNavState = {
  windowStart: Date;
  selectedDate: Date;
};

function buildInitialNav(baseline: Date): ScheduleNavState {
  const windowStart = startOfWeekSunday(baseline);
  return { windowStart, selectedDate: baseline };
}

function shiftWeek(
  prev: ScheduleNavState,
  deltaDays: number,
  today: Date,
): ScheduleNavState {
  if (
    deltaDays < 0 &&
    compareCalendarDays(
      addDays(prev.windowStart, deltaDays + SCHEDULE_DATE_STRIP_VISIBLE_DAYS - 1),
      today,
    ) < 0
  ) {
    return prev;
  }

  const nextWs = addDays(prev.windowStart, deltaDays);
  const first = startOfLocalDay(nextWs);
  const last = addDays(first, 6);
  const sel = startOfLocalDay(prev.selectedDate);
  const outOfRange = sel.getTime() < first.getTime() || sel.getTime() > last.getTime();
  const nextSelected = outOfRange ? first : prev.selectedDate;
  const clampedSelected = isBeforeCalendarDay(nextSelected, today) ? today : nextSelected;

  return {
    windowStart: nextWs,
    selectedDate: clampedSelected,
  };
}

type MarketingScheduleViewProps = {
  initialItems: MarketingScheduleItem[];
};

function mapDayToDate(
  weekStart: Date,
  day: MarketingScheduleDayOfWeek,
  dayToOffset: Record<MarketingScheduleDayOfWeek, number>,
): Date {
  return addDays(weekStart, dayToOffset[day]);
}

function scheduleItemDate(
  item: MarketingScheduleItem,
  baselineWeekStart: Date,
  dayToOffset: Record<MarketingScheduleDayOfWeek, number>,
): Date {
  return item.sessionDate !== null
    ? startOfLocalDay(new Date(item.sessionDate))
    : mapDayToDate(baselineWeekStart, item.dayOfWeek, dayToOffset);
}

export function MarketingScheduleView({ initialItems }: MarketingScheduleViewProps) {
  const t = useTranslations("marketingPages.schedule");
  const locale = useLocale();
  const audience = useMarketingAudience();
  const isMember = audience === "member";
  const [items, setItems] = useState<MarketingScheduleItem[]>(initialItems);
  const [sessionsReady, setSessionsReady] = useState(initialItems.length > 0);
  const [bookedBySessionId, setBookedBySessionId] = useState<Record<string, string>>({});
  const [memberBookingsLoaded, setMemberBookingsLoaded] = useState(!isMember);
  const [baseline] = useState(() => startOfLocalDay(new Date()));
  const [nav, setNav] = useState<ScheduleNavState>(() => buildInitialNav(baseline));
  const [classType, setClassType] = useState("all");
  const [instructor, setInstructor] = useState("all");
  const [scheduleNow, setScheduleNow] = useState(() => new Date());
  const bookedBySessionIdRef = useRef(bookedBySessionId);
  useEffect(() => {
    bookedBySessionIdRef.current = bookedBySessionId;
  }, [bookedBySessionId]);
  const { waitlistedSessionIds, loaded: memberWaitlistLoaded, refetch: refetchWaitlist } =
    useMemberWaitlistData(isMember);
  const memberActionStateReady =
    !isMember || (memberBookingsLoaded && memberWaitlistLoaded);

  const refetchMemberBookings = useCallback(async (markLoaded: boolean) => {
    if (!isMember) {
      setMemberBookingsLoaded(true);
      setBookedBySessionId({});
      return;
    }
    try {
      const rows = await apiFetch<UserBookingRow[]>("/bookings/me");
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
      if (markLoaded) {
        setMemberBookingsLoaded(true);
      }
    }
  }, [isMember]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!isMember) {
        if (!cancelled) {
          setMemberBookingsLoaded(true);
          setBookedBySessionId({});
        }
        return;
      }
      try {
        const rows = await apiFetch<UserBookingRow[]>("/bookings/me");
        if (cancelled) {
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
        if (!cancelled) {
          setMemberBookingsLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialItems, isMember]);

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

  const classTypeOptions = useMemo<readonly ScheduleFilterOption<string>[]>(() => {
    const distinct = getScheduleClassTypeValues(items);
    return [
      { value: "all", label: t("filterClassTypeAll") },
      ...distinct.map((value) => ({ value, label: value })),
    ];
  }, [items, t]);

  const instructorOptions = useMemo<readonly ScheduleFilterOption<string>[]>(() => {
    const distinct = Array.from(
      new Set(items.map((item) => item.instructorName.trim())),
    ).filter((value) => value.length > 0);
    return [
      { value: "all", label: t("filterInstructorAll") },
      ...distinct.map((value) => ({ value, label: value })),
    ];
  }, [items, t]);

  const dayToOffset = useMemo<Record<MarketingScheduleDayOfWeek, number>>(
    () => ({
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    }),
    [],
  );

  const visibleSessions = useMemo(() => {
    const baselineWeekStart = startOfWeekSunday(baseline);
    return items
      .filter((item) => item.isActive)
      .filter((item) => isUpcomingPublicScheduleSession(item, scheduleNow))
      .filter((item) => {
        const rowDay = scheduleItemDate(item, baselineWeekStart, dayToOffset);
        if (!isSameCalendarDay(rowDay, nav.selectedDate)) return false;
        if (classType !== "all" && item.classType !== classType) return false;
        if (instructor !== "all" && item.instructorName !== instructor) return false;
        return true;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [baseline, nav.selectedDate, classType, instructor, items, dayToOffset, scheduleNow]);

  const selectedDayKey = nav.selectedDate.toISOString().slice(0, 10);
  const { contentRef, renderedDayKey, renderedSessions, animationPhase, containerStyle, getItemStyle } =
    useScheduleDayTransition({
      selectedDayKey,
      visibleSessions,
    });

  return (
    <div className="ommm-card flex w-full min-w-0 flex-col gap-6 p-5 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8">
      <ScheduleFiltersHeader
        filterClassType={classType}
        filterInstructor={instructor}
        classTypeOptions={classTypeOptions}
        instructorOptions={instructorOptions}
        onClassTypeChange={setClassType}
        onInstructorChange={setInstructor}
      />
      <ScheduleDateControls
        locale={locale}
        selectedDate={nav.selectedDate}
        windowStart={nav.windowStart}
        onSelectDay={(d) => {
          if (isBeforeCalendarDay(d, baseline)) return;
          setNav((s) => ({ ...s, selectedDate: d }));
        }}
        onShiftWindow={(delta) =>
          setNav((s) => shiftWeek(s, delta, baseline))
        }
      />
      <div
        className="mt-0 overflow-hidden transition-[height] duration-300 ease-out motion-reduce:transition-none"
        style={containerStyle}
      >
        <div
          ref={contentRef}
          className={
            animationPhase === "exit"
              ? styles.scheduleListExit
              : animationPhase === "enter"
                ? styles.scheduleListEnter
                : ""
          }
        >
          <ul key={renderedDayKey} className="list-none overflow-hidden p-0">
            {!sessionsReady ? (
              <MarketingScheduleSessionsSkeleton />
            ) : renderedSessions.length === 0 ? (
              <li
                className={`py-12 text-center text-sm ${SCHEDULE_MUTED} ${
                  animationPhase === "enter" ? styles.scheduleItemEnter : ""
                }`}
              >
                {t("empty")}
              </li>
            ) : (
              renderedSessions.map((row, index) => {
                const userOnWaitlist =
                  bookedBySessionId[row.id] === undefined && waitlistedSessionIds.has(row.id);
                const displayRow = resolveMemberScheduleRowDisplay({
                  row,
                  onWaitlist: userOnWaitlist,
                  capacityReady: memberWaitlistLoaded,
                });
                const showOnWaitlist = resolveMemberOnWaitlistBadge({
                  userBookingId: bookedBySessionId[row.id],
                  onWaitlist: userOnWaitlist,
                  availableSpots: displayRow.availableSpots,
                  sessionStatus: displayRow.status,
                  capacityReady: memberWaitlistLoaded,
                });

                return (
                  <ScheduleSessionRow
                    key={row.id}
                    row={displayRow}
                    bookLabel={t("bookCta")}
                    audience={audience}
                    subtitle={`${row.instructorName} • ${row.classType}`}
                    spotsFullLabel={t("spotsFull")}
                    spotsLeftLabel={t("spotsLeft", { count: displayRow.availableSpots })}
                    spotsLoadingLabel={t("actionLoading")}
                    timeLabel={formatScheduleTimeHHmm(locale, row.startTime)}
                    durationLabel={
                      row.durationMinutes !== null
                        ? t("minutesShort", { count: row.durationMinutes })
                        : row.endTime !== null
                          ? `${formatScheduleTimeHHmm(locale, row.startTime)} - ${formatScheduleTimeHHmm(locale, row.endTime)}`
                          : "-"
                    }
                    userBookingId={bookedBySessionId[row.id]}
                    bookingStateReady={memberActionStateReady}
                    isOnWaitlist={showOnWaitlist}
                    onBooked={handleBooked}
                    onCancelled={handleCancelled}
                    onWaitlisted={handleWaitlisted}
                    onWaitlistLeft={handleWaitlistLeft}
                    className={animationPhase === "enter" ? styles.scheduleItemEnter : ""}
                    style={getItemStyle(index)}
                  />
                );
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
