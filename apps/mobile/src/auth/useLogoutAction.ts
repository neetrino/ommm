import { useRouter } from "expo-router";
import { useCallback } from "react";
import { useSession } from "./SessionProvider";

const WELCOME_HREF = "/welcome" as const;

/**
 * Clears the local session and navigates to the welcome / sign-in entry route.
 */
export function useLogoutAction() {
  const router = useRouter();
  const { signOut } = useSession();

  return useCallback(async () => {
    await signOut();
    router.replace(WELCOME_HREF);
  }, [router, signOut]);
}
