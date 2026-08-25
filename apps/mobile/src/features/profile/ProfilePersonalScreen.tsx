import { ProfileAccountInfoSection } from "./components/ProfileAccountInfoSection";
import { ProfileChangePasswordSection } from "./components/ProfileChangePasswordSection";
import { ProfileDangerZoneSection } from "./components/ProfileDangerZoneSection";
import { ProfileHomeImageSection } from "./components/ProfileHomeImageSection";
import { ProfileScreenShell } from "./components/ProfileScreenShell";
import { useTranslations } from "../../i18n/I18nProvider";

export function ProfilePersonalScreen() {
  const tProfile = useTranslations("userPages.profile");

  return (
    <ProfileScreenShell title={tProfile("accountInfo")}>
      <ProfileHomeImageSection />
      <ProfileAccountInfoSection />
      <ProfileChangePasswordSection showSectionTitle />
      <ProfileDangerZoneSection />
    </ProfileScreenShell>
  );
}
