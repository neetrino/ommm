import { ProfileChangePasswordSection } from "./components/ProfileChangePasswordSection";
import { ProfileScreenShell } from "./components/ProfileScreenShell";
import { useTranslations } from "../../i18n/I18nProvider";

export function ProfileChangePasswordScreen() {
  const tHub = useTranslations("userPages.accountHub");

  return (
    <ProfileScreenShell title={tHub("changePassword")}>
      <ProfileChangePasswordSection />
    </ProfileScreenShell>
  );
}
