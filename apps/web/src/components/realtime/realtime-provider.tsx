"use client";

import {
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
import { resolvePublicApiOrigin } from "@/lib/realtime/resolve-api-origin";
import {
  createRealtimeSseClient,
  type RealtimeConnectionStatus,
} from "@/lib/realtime/realtime-sse-client";

type RealtimeProviderProps = {
  children: ReactNode;
  /** Logged-in users: `/v1/realtime/events` only (includes public events). */
  authenticated: boolean;
  /** Guests on live surfaces: `/v1/realtime/public` only. Ignored when authenticated. */
  enablePublic?: boolean;
};

function buildSseUrl(authenticated: boolean): string | null {
  const origin = resolvePublicApiOrigin();
  if (authenticated) {
    return `${origin}/v1/realtime/events`;
  }
  return `${origin}/v1/realtime/public`;
}

export function RealtimeProvider({
  children,
  authenticated,
  enablePublic = true,
}: RealtimeProviderProps) {
  const registryRef = useRef<RealtimeRefetchRegistry | null>(null);
  if (registryRef.current === null) {
    registryRef.current = new RealtimeRefetchRegistry();
  }
  const registry = registryRef.current;

  const [connectionStatus, setConnectionStatus] =
    useState<RealtimeConnectionStatus>("disconnected");

  const shouldConnect = authenticated || enablePublic;

  useEffect(() => {
    if (!shouldConnect || typeof window === "undefined") {
      setConnectionStatus("disconnected");
      return undefined;
    }

    const url = buildSseUrl(authenticated);
    if (url === null) {
      return undefined;
    }

    const client = createRealtimeSseClient({
      url,
      withCredentials: true,
      onOpen: () => {
        registry.forceRefetchAllRegistered();
      },
      onEvent: (event) => {
        const keys = refetchKeysForEvent(event);
        if (keys.length > 0) {
          registry.requestRefetch(keys);
        }
      },
      onStatusChange: setConnectionStatus,
    });

    return () => {
      client.close();
    };
  }, [authenticated, registry, shouldConnect]);

  const value = useMemo(
    (): RealtimeContextValue => ({
      connectionStatus,
      registerRefetch: registry.register.bind(registry),
    }),
    [connectionStatus, registry],
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
