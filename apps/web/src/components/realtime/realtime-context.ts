"use client";

import { createContext } from "react";
import type { RealtimeRefetchRegistry } from "@/lib/realtime/realtime-refetch-registry";
import type { RealtimeConnectionStatus } from "@/lib/realtime/realtime-sse-client";

export type RealtimeContextValue = {
  connectionStatus: RealtimeConnectionStatus;
  registerRefetch: RealtimeRefetchRegistry["register"];
};

export const RealtimeContext = createContext<RealtimeContextValue | null>(null);
