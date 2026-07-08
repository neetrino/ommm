import { useRouter } from "expo-router";
import { useCallback } from "react";
import { useSession } from "../../auth/SessionProvider";
import { userMemberPath } from "../../navigation/memberPaths";

/** Shared "Book a Class" header CTA — same behavior as Home. */
export function useAppHeaderBookPress() {
  const router = useRouter();
  const { isSignedIn } = useSession();

  return useCallback(() => {
    if (isSignedIn) {
      router.push(userMemberPath("classes"));
      return;
    }
    router.push("/login");
  }, [isSignedIn, router]);
}
