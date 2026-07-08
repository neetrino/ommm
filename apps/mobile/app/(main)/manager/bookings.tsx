import { PlaceholderTabScreen } from "../../../src/features/shell/PlaceholderTabScreen";
import { usePlaceholderTabCopy } from "../../../src/features/shell/usePlaceholderTabCopy";

export default function ManagerBookingsMobileRoute() {
  const copy = usePlaceholderTabCopy("MANAGER", "bookings");

  return <PlaceholderTabScreen title={copy.title} subtitle={copy.subtitle} />;
}
