import { Redirect } from "expo-router";
import { MemberScheduleScreen } from "../../src/features/member/screens/MemberScheduleScreen";
import { useSession } from "../../src/auth/SessionProvider";

export default function ScheduleRoute() {
  const { isReady, isSignedIn, role } = useSession();

  if (isReady && isSignedIn && role === "USER") {
    return <Redirect href="/user/schedule" />;
  }

  return <MemberScheduleScreen />;
}
