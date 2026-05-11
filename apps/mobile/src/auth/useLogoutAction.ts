import { useRouter } from "expo-router";
import { useCallback } from "react";
import { useSession } from "./SessionProvider";

const HOME_HREF = "/home" as const;

/**
 * Clears the local session and replaces the navigation stack with Home (guest experience).
 */
export function useLogoutAction() {
  const router = useRouter();
  const { signOut } = useSession();

  return useCallback(async () => {
    await signOut();
    router.replace(HOME_HREF);
  }, [router, signOut]);
}
