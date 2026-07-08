import { ProfileChangePasswordSection } from "./components/ProfileChangePasswordSection";
import { ProfileScreenShell } from "./components/ProfileScreenShell";

export function ProfileChangePasswordScreen() {
  return (
    <ProfileScreenShell title="Change password">
      <ProfileChangePasswordSection />
    </ProfileScreenShell>
  );
}
