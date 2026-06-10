"use client";

import { useContext, useEffect, useRef } from "react";
import { RealtimeContext } from "@/components/realtime/realtime-context";
import type { RealtimeRefetchKey } from "@/lib/realtime/realtime-refetch-keys";

/**
 * Registers a REST refetch handler for a registry key when inside {@link RealtimeProvider}.
 * No-op when the provider is absent (SSR-only subtrees).
 */
export function useRealtimeRefetch(
  key: RealtimeRefetchKey,
  refetch: () => void | Promise<void>,
  enabled = true,
): void {
  const ctx = useContext(RealtimeContext);
  const refetchRef = useRef(refetch);

  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  useEffect(() => {
    if (!ctx || !enabled) {
      return undefined;
    }
    return ctx.registerRefetch(key, () => refetchRef.current());
  }, [ctx, enabled, key]);
}
