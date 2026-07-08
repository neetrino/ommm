import { PlaceholderTabScreen } from "../../../src/features/shell/PlaceholderTabScreen";
import { usePlaceholderTabCopy } from "../../../src/features/shell/usePlaceholderTabCopy";

export default function ManagerClientsMobileRoute() {
  const copy = usePlaceholderTabCopy("MANAGER", "clients");

  return <PlaceholderTabScreen title={copy.title} subtitle={copy.subtitle} />;
}
