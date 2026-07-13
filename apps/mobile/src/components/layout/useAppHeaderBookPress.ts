import { useRouter } from "expo-router";
import { useCallback } from "react";
import { useSession } from "../../auth/SessionProvider";
import { coachPath, userMemberPath } from "../../navigation/memberPaths";

/** Shared "Book a Class" header CTA — role-aware destination. */
export function useAppHeaderBookPress() {
  const router = useRouter();
  const { isSignedIn, role } = useSession();

  return useCallback(() => {
    if (!isSignedIn) {
      router.push("/login");
      return;
    }
    if (role === "COACH") {
      router.push(coachPath("schedule"));
      return;
    }
    router.push(userMemberPath("classes"));
  }, [isSignedIn, role, router]);
}
