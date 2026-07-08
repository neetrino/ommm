import { ProfileHomeImageSection } from "./components/ProfileHomeImageSection";
import { ProfileScreenShell } from "./components/ProfileScreenShell";

export function ProfilePersonalScreen() {
  return (
    <ProfileScreenShell title="Personal information">
      <ProfileHomeImageSection />
    </ProfileScreenShell>
  );
}
