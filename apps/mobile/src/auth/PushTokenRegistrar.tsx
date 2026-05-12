import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { readStoredAccessToken } from "./accessTokenStorage";
import { tryRegisterExpoPushToken } from "./tryRegisterExpoPushToken";
import { useSession } from "./SessionProvider";

/**
 * Registers the device for Expo push when a session exists (native only).
 */
export function PushTokenRegistrar() {
  const { isReady, isSignedIn } = useSession();
  const registered = useRef(false);

  useEffect(() => {
    if (!isReady || !isSignedIn || registered.current) {
      return;
    }
    if (Platform.OS === "web") {
      return;
    }
    void (async () => {
      const token = await readStoredAccessToken();
      if (token === null) {
        return;
      }
      try {
        const ok = await tryRegisterExpoPushToken(token);
        if (ok) {
          registered.current = true;
        }
      } catch {
        // Non-fatal: user can still use the app without push.
      }
    })();
  }, [isReady, isSignedIn]);

  return null;
}
