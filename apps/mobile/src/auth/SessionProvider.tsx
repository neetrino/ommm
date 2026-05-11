import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  readSessionSignedIn,
  writeSessionSignedIn,
} from "./persistedSession";

type SessionContextValue = {
  isReady: boolean;
  isSignedIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const signedIn = await readSessionSignedIn();
      if (!cancelled) {
        setIsSignedIn(signedIn);
        setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async () => {
    await writeSessionSignedIn(true);
    setIsSignedIn(true);
  }, []);

  const signOut = useCallback(async () => {
    await writeSessionSignedIn(false);
    setIsSignedIn(false);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      isReady,
      isSignedIn,
      signIn,
      signOut,
    }),
    [isReady, isSignedIn, signIn, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (ctx === null) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}
