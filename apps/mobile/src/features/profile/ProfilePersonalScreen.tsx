import { ProfileHomeImageSection } from "./components/ProfileHomeImageSection";
import { ProfileScreenShell } from "./components/ProfileScreenShell";
import { useTranslations } from "../../i18n/I18nProvider";

export function ProfilePersonalScreen() {
  const tProfile = useTranslations("userPages.profile");

  return (
    <ProfileScreenShell title={tProfile("accountInfo")}>
      <ProfileHomeImageSection />
    </ProfileScreenShell>
  );
}
