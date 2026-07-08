import { Redirect } from "expo-router";
import { MemberPackagesScreen } from "../../src/features/member/screens/MemberPackagesScreen";
import { useSession } from "../../src/auth/SessionProvider";

export default function PackagesRoute() {
  const { isReady, isSignedIn, role } = useSession();

  if (isReady && isSignedIn && role === "USER") {
    return <Redirect href="/user/packages" />;
  }

  return <MemberPackagesScreen />;
}
