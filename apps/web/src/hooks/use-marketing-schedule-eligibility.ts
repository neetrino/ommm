"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  buildScheduleSessionEligibilityMap,
  type ScheduleSessionEligibilityMap,
  type ScheduleSessionEligibilityRow,
} from "@/lib/schedule-session-eligibility";

type UseMarketingScheduleEligibilityOptions = {
  isMember: boolean;
  sessionIds: readonly string[];
  enabled?: boolean;
  refreshKey?: string;
};

export function useMarketingScheduleEligibility({
  isMember,
  sessionIds,
  enabled = true,
  refreshKey = "",
}: UseMarketingScheduleEligibilityOptions) {
  const [eligibilityBySessionId, setEligibilityBySessionId] =
    useState<ScheduleSessionEligibilityMap>(() => new Map());
  const [eligibilityLoaded, setEligibilityLoaded] = useState(!isMember);

  const sessionIdsKey = useMemo(
    () => [...new Set(sessionIds)].sort().join(","),
    [sessionIds],
  );

  useEffect(() => {
    if (!isMember || !enabled) {
      setEligibilityBySessionId(new Map());
      setEligibilityLoaded(true);
      return;
    }

    const uniqueIds = sessionIdsKey.length > 0 ? sessionIdsKey.split(",") : [];
    if (uniqueIds.length === 0) {
      setEligibilityBySessionId(new Map());
      setEligibilityLoaded(true);
      return;
    }

    let cancelled = false;
    setEligibilityLoaded(false);

    const query = encodeURIComponent(uniqueIds.join(","));
    void apiFetch<ScheduleSessionEligibilityRow[]>(
      `/bookings/sessions/eligibility?ids=${query}`,
    )
      .then((rows) => {
        if (cancelled) {
          return;
        }
        setEligibilityBySessionId(buildScheduleSessionEligibilityMap(rows));
      })
      .catch(() => {
        if (!cancelled) {
          setEligibilityBySessionId(new Map());
        }
      })
      .finally(() => {
        if (!cancelled) {
          setEligibilityLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, isMember, refreshKey, sessionIdsKey]);

  return { eligibilityBySessionId, eligibilityLoaded };
}
