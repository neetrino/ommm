import { Redirect } from "expo-router";
import { PlaceholderTabScreen } from "../../src/features/shell/PlaceholderTabScreen";
import { useSession } from "../../src/auth/SessionProvider";

export default function PlansRoute() {
  const { isReady, isSignedIn, role } = useSession();

  if (isReady && isSignedIn && role === "USER") {
    return <Redirect href="/user/plans" />;
  }

  return (
    <PlaceholderTabScreen
      title="Plans"
      subtitle="Memberships and passes will appear here once billing endpoints are connected."
    />
  );
}
