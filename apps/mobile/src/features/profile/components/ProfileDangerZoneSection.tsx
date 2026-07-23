import { Text } from "react-native";
import { useSession } from "../../../auth/SessionProvider";
import { useTranslations } from "../../../i18n/I18nProvider";
import { DeleteAccountHubButton } from "./DeleteAccountHubButton";
import { ProfileGlassCard } from "./ProfileGlassCard";
import { profileDangerZoneSectionStyles as styles } from "./profileDangerZoneSection.styles";

/** Account Information — irreversible account actions. */
export function ProfileDangerZoneSection() {
  const { role } = useSession();
  const tProfile = useTranslations("userPages.profile");

  if (role === "COACH") {
    return null;
  }

  return (
    <ProfileGlassCard
      style={styles.dangerFrame}
      contentStyle={styles.card}
    >
      <Text style={styles.sectionTitle}>{tProfile("dangerZone")}</Text>
      <Text style={styles.sectionLead}>{tProfile("dangerZoneLead")}</Text>

      <DeleteAccountHubButton />
    </ProfileGlassCard>
  );
}
