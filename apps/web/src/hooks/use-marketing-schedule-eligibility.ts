"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { apiFetch } from "@/lib/api";
import { PACKAGES_REFRESH_EVENT } from "@/lib/packages-refresh-event";
import {
  clearCachedMarketingScheduleEligibility,
  getMarketingScheduleEligibilityClientSnapshot,
  getMarketingScheduleEligibilityServerSnapshot,
  MARKETING_SCHEDULE_ELIGIBILITY_UPDATED,
  writeCachedMarketingScheduleEligibility,
} from "@/lib/marketing-schedule-eligibility-cache";
import type { ScheduleSessionEligibilityRow } from "@/lib/schedule-session-eligibility";

type UseMarketingScheduleEligibilityOptions = {
  isMember: boolean;
  sessionIds: readonly string[];
};

function subscribeEligibility(onStoreChange: () => void): () => void {
  const handler = (): void => {
    onStoreChange();
  };
  window.addEventListener(MARKETING_SCHEDULE_ELIGIBILITY_UPDATED, handler);
  return () => {
    window.removeEventListener(MARKETING_SCHEDULE_ELIGIBILITY_UPDATED, handler);
  };
}

export function useMarketingScheduleEligibility({
  isMember,
  sessionIds,
}: UseMarketingScheduleEligibilityOptions) {
  const eligibilityBySessionId = useSyncExternalStore(
    subscribeEligibility,
    getMarketingScheduleEligibilityClientSnapshot,
    getMarketingScheduleEligibilityServerSnapshot,
  );
  const [fetchSettled, setFetchSettled] = useState(!isMember);
  const [refreshNonce, setRefreshNonce] = useState(0);

  const sessionIdsKey = useMemo(
    () => [...new Set(sessionIds)].sort().join(","),
    [sessionIds],
  );

  useEffect(() => {
    if (!isMember) {
      return;
    }
    const onPackagesRefresh = (): void => {
      setRefreshNonce((current) => current + 1);
    };
    window.addEventListener(PACKAGES_REFRESH_EVENT, onPackagesRefresh);
    return () => {
      window.removeEventListener(PACKAGES_REFRESH_EVENT, onPackagesRefresh);
    };
  }, [isMember]);

  useEffect(() => {
    if (!isMember) {
      clearCachedMarketingScheduleEligibility();
      setFetchSettled(true);
      return;
    }

    const uniqueIds = sessionIdsKey.length > 0 ? sessionIdsKey.split(",") : [];
    if (uniqueIds.length === 0) {
      writeCachedMarketingScheduleEligibility([]);
      setFetchSettled(true);
      return;
    }

    // Soft-nav: show cached badges immediately while refreshing.
    if (getMarketingScheduleEligibilityClientSnapshot().size > 0) {
      setFetchSettled(true);
    }

    let cancelled = false;
    const query = encodeURIComponent(uniqueIds.join(","));
    void apiFetch<ScheduleSessionEligibilityRow[]>(
      `/bookings/sessions/eligibility?ids=${query}`,
    )
      .then((rows) => {
        if (cancelled) {
          return;
        }
        writeCachedMarketingScheduleEligibility(rows);
        setFetchSettled(true);
      })
      .catch(() => {
        if (!cancelled) {
          setFetchSettled(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isMember, refreshNonce, sessionIdsKey]);

  return {
    eligibilityBySessionId,
    eligibilityLoaded: !isMember || fetchSettled || eligibilityBySessionId.size > 0,
  };
}
