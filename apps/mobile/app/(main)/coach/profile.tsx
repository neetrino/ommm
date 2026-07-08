import { PlaceholderTabScreen } from "../../../src/features/shell/PlaceholderTabScreen";
import { usePlaceholderTabCopy } from "../../../src/features/shell/usePlaceholderTabCopy";

export default function CoachProfileMobileRoute() {
  const copy = usePlaceholderTabCopy("COACH", "profile");

  return <PlaceholderTabScreen title={copy.title} subtitle={copy.subtitle} />;
}
