"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "@/lib/debounced-callback";
import { useRealtimeRefetch } from "@/hooks/use-realtime-refetch";
import { NOTIFICATIONS_REFRESH_EVENT } from "@/lib/notifications-refresh-event";
import { REALTIME_REFETCH_KEYS } from "@/lib/realtime/realtime-refetch-keys";
import { fetchMemberWaitlistDeduped } from "@/lib/member-waitlist-fetch";
import type { UserWaitlistRow } from "@/lib/user-booking-types";

export type MemberWaitlistRefetchOptions = {
  silent?: boolean;
};

export type MemberWaitlistData = {
  rows: UserWaitlistRow[];
  offeredRows: UserWaitlistRow[];
  waitlistedSessionIds: ReadonlySet<string>;
  unreadCount: number;
  loading: boolean;
  loaded: boolean;
  error: boolean;
  refetch: (options?: MemberWaitlistRefetchOptions) => Promise<void>;
};

const WAITLIST_OFFERED_STATUS = "OFFERED";
const WAITLIST_ACTIVE_STATUS = "ACTIVE";
const WAITLIST_REFRESH_DEBOUNCE_MS = 400;

function toWaitlistSets(rows: readonly UserWaitlistRow[]): {
  offeredRows: UserWaitlistRow[];
  waitlistedSessionIds: ReadonlySet<string>;
} {
  const offeredRows = rows.filter((row) => row.status === WAITLIST_OFFERED_STATUS);
  const waitlistedSessionIds = new Set(
    rows
      .filter(
        (row) =>
          row.status === WAITLIST_ACTIVE_STATUS || row.status === WAITLIST_OFFERED_STATUS,
      )
      .map((row) => row.session.id),
  );
  return { offeredRows, waitlistedSessionIds };
}

/**
 * Fetches the member waitlist and derives spot-open notification rows.
 * Backend sends waitlist offers by email; in-app inbox uses OFFERED entries from GET /waitlist/me.
 */
export function useMemberWaitlistData(enabled: boolean): MemberWaitlistData {
  const [rows, setRows] = useState<UserWaitlistRow[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [loaded, setLoaded] = useState(!enabled);
  const [error, setError] = useState(false);

  const refetch = useCallback(async (options?: MemberWaitlistRefetchOptions) => {
    if (!enabled) {
      setRows([]);
      setLoading(false);
      setLoaded(true);
      setError(false);
      return;
    }
    if (!options?.silent) {
      setLoading(true);
    }
    setError(false);
    try {
      const data = await fetchMemberWaitlistDeduped();
      setRows(data);
    } catch {
      setRows([]);
      setError(true);
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
      setLoaded(true);
    }
  }, [enabled]);

  const debouncedSilentRefetch = useDebouncedCallback(() => {
    void refetch({ silent: true });
  }, WAITLIST_REFRESH_DEBOUNCE_MS);

  useRealtimeRefetch(
    REALTIME_REFETCH_KEYS.WAITLIST_ME,
    () => refetch({ silent: true }),
    enabled,
  );

  useEffect(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    const handleRefresh = (): void => {
      debouncedSilentRefetch();
    };
    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, handleRefresh);
    };
  }, [debouncedSilentRefetch, enabled]);

  const { offeredRows, waitlistedSessionIds } = toWaitlistSets(rows);

  return {
    rows,
    offeredRows,
    waitlistedSessionIds,
    unreadCount: offeredRows.length,
    loading,
    loaded,
    error,
    refetch,
  };
}
