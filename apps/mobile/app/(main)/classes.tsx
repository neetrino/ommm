import { Redirect } from "expo-router";
import { PlaceholderTabScreen } from "../../src/features/shell/PlaceholderTabScreen";
import { useSession } from "../../src/auth/SessionProvider";

export default function ClassesRoute() {
  const { isReady, isSignedIn, role } = useSession();

  if (isReady && isSignedIn && role === "USER") {
    return <Redirect href="/user/classes" />;
  }

  return <PlaceholderTabScreen title="Classes" />;
}
