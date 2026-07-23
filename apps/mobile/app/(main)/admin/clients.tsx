import { PlaceholderTabScreen } from "../../../src/features/shell/PlaceholderTabScreen";
import { usePlaceholderTabCopy } from "../../../src/features/shell/usePlaceholderTabCopy";

export default function AdminClientsRoute() {
  const copy = usePlaceholderTabCopy("ADMIN", "clients");

  return <PlaceholderTabScreen title={copy.title} subtitle={copy.subtitle} />;
}
