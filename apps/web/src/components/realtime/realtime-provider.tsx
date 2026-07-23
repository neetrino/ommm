"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { RealtimeContext, type RealtimeContextValue } from "@/components/realtime/realtime-context";
import { refetchKeysForEvent } from "@/lib/realtime/realtime-refetch-keys";
import { RealtimeRefetchRegistry } from "@/lib/realtime/realtime-refetch-registry";
import {
  createRealtimeSseClient,
  type RealtimeConnectionStatus,
} from "@/lib/realtime/realtime-sse-client";

/** Same-origin paths so the session cookie is sent (Next `/api/v1` rewrite → Nest). */
const REALTIME_SSE_AUTHENTICATED_PATH = "/api/v1/realtime/events";
const REALTIME_SSE_PUBLIC_PATH = "/api/v1/realtime/public";

type RealtimeProviderProps = {
  children: ReactNode;
  /** Logged-in users: authenticated SSE stream (includes public events). */
  authenticated: boolean;
  /** Guests on live surfaces: public SSE only. Ignored when authenticated. */
  enablePublic?: boolean;
};

function buildSseUrl(authenticated: boolean): string {
  return authenticated
    ? REALTIME_SSE_AUTHENTICATED_PATH
    : REALTIME_SSE_PUBLIC_PATH;
}

export function RealtimeProvider({
  children,
  authenticated,
  enablePublic = true,
}: RealtimeProviderProps) {
  const registryRef = useRef(new RealtimeRefetchRegistry());
  const hadSseConnectedRef = useRef(false);

  const registerRefetch = useCallback<RealtimeRefetchRegistry["register"]>(
    (key, handler) => registryRef.current.register(key, handler),
    [],
  );

  const [sseConnectionStatus, setSseConnectionStatus] =
    useState<RealtimeConnectionStatus>("disconnected");

  const shouldConnect = authenticated || enablePublic;
  const connectionStatus: RealtimeConnectionStatus = shouldConnect
    ? sseConnectionStatus
    : "disconnected";

  useEffect(() => {
    if (!shouldConnect || typeof window === "undefined") {
      return undefined;
    }

    const client = createRealtimeSseClient({
      url: buildSseUrl(authenticated),
      withCredentials: true,
      onOpen: () => {
        // Initial connect is covered by client hydration refetch; reconnects force refresh.
        if (hadSseConnectedRef.current) {
          registryRef.current.forceRefetchAllRegistered();
        } else {
          hadSseConnectedRef.current = true;
        }
      },
      onEvent: (event) => {
        const keys = refetchKeysForEvent(event);
        if (keys.length > 0) {
          registryRef.current.requestRefetch(keys);
        }
      },
      onStatusChange: setSseConnectionStatus,
    });

    return () => {
      client.close();
    };
  }, [authenticated, shouldConnect]);

  const value = useMemo(
    (): RealtimeContextValue => ({
      connectionStatus,
      registerRefetch,
    }),
    [connectionStatus, registerRefetch],
  );

  return (
    <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
  );
}

export function useRealtimeContext(): RealtimeContextValue {
  const ctx = useContext(RealtimeContext);
  if (ctx === null) {
    throw new Error("useRealtimeContext must be used within RealtimeProvider");
  }
  return ctx;
}

export function useRealtimeConnectionStatus(): RealtimeConnectionStatus {
  const ctx = useContext(RealtimeContext);
  return ctx?.connectionStatus ?? "disconnected";
}
