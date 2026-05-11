import { Redirect } from "expo-router";
import { PlaceholderTabScreen } from "../../src/features/shell/PlaceholderTabScreen";
import { useSession } from "../../src/auth/SessionProvider";

export default function ScheduleRoute() {
  const { isReady, isSignedIn, role } = useSession();

  if (isReady && isSignedIn && role === "USER") {
    return <Redirect href="/user/schedule" />;
  }

  return (
    <PlaceholderTabScreen
      title="Schedule"
      subtitle="Your full calendar will sync with the Nest API when scheduling endpoints are ready."
    />
  );
}
