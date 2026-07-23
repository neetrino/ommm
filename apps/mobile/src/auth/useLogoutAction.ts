import { useRouter } from "expo-router";
import { useCallback } from "react";
import { useSession } from "./SessionProvider";

const LOGIN_HREF = "/login" as const;

/**
 * Clears the local session and replaces the navigation stack with Login.
 */
export function useLogoutAction() {
  const router = useRouter();
  const { signOut } = useSession();

  return useCallback(async () => {
    await signOut();
    router.replace(LOGIN_HREF);
  }, [router, signOut]);
}
