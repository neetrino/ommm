import { Redirect } from "expo-router";
import { MemberClassesScreen } from "../../src/features/member/screens/MemberClassesScreen";
import { useSession } from "../../src/auth/SessionProvider";

export default function ClassesRoute() {
  const { isReady, isSignedIn, role } = useSession();

  if (isReady && isSignedIn && role === "USER") {
    return <Redirect href="/user/classes" />;
  }

  return <MemberClassesScreen />;
}
