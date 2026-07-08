import { PlaceholderTabScreen } from "../../../src/features/shell/PlaceholderTabScreen";
import { usePlaceholderTabCopy } from "../../../src/features/shell/usePlaceholderTabCopy";

export default function ManagerProfileMobileRoute() {
  const copy = usePlaceholderTabCopy("MANAGER", "profile");

  return <PlaceholderTabScreen title={copy.title} subtitle={copy.subtitle} />;
}
