"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { RealtimeProvider } from "@/components/realtime/realtime-provider";

const RealtimeAuthSetterContext = createContext<
  Dispatch<SetStateAction<boolean>> | null
>(null);

type MarketingRealtimeRootProps = {
  children: ReactNode;
  serverAuthenticated: boolean;
};

/** Marketing layout — one SSE connection per tab; auth mode syncs from header account state. */
export function MarketingRealtimeRoot({
  children,
  serverAuthenticated,
}: MarketingRealtimeRootProps) {
  const [authenticated, setAuthenticated] = useState(serverAuthenticated);

  useEffect(() => {
    setAuthenticated(serverAuthenticated);
  }, [serverAuthenticated]);

  return (
    <RealtimeAuthSetterContext.Provider value={setAuthenticated}>
      <RealtimeProvider authenticated={authenticated} enablePublic={!authenticated}>
        {children}
      </RealtimeProvider>
    </RealtimeAuthSetterContext.Provider>
  );
}

/** Keeps SSE auth mode aligned with marketing header account resolution. */
export function useSyncMarketingRealtimeAuth(isAuthenticated: boolean): void {
  const setAuthenticated = useContext(RealtimeAuthSetterContext);
  useEffect(() => {
    setAuthenticated?.(isAuthenticated);
  }, [isAuthenticated, setAuthenticated]);
}
