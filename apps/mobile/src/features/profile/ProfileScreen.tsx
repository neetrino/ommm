import { useRouter } from "expo-router";
import { View } from "react-native";
import { useSession } from "../../auth/SessionProvider";
import { LanguageSwitcher } from "../../i18n/LanguageSwitcher";
import { accountHubLayout } from "./accountHubLayout";
import {
  type AccountHubRole,
  useAccountHubMenuItems,
} from "./accountHubMenu";
import { AccountHubHeader } from "./components/AccountHubHeader";
import { AccountHubMenuRow } from "./components/AccountHubMenuRow";
import { ProfileGlassCard } from "./components/ProfileGlassCard";
import { ProfileHubMobileActionFooter } from "./components/ProfileHubMobileActionFooter";
import { ProfileScreenShell } from "./components/ProfileScreenShell";

type ProfileScreenProps = {
  /** Defaults to USER account hub routes under `/user/profile/*`. */
  hubRole?: AccountHubRole;
};

export function ProfileScreen({ hubRole = "USER" }: ProfileScreenProps) {
  const router = useRouter();
  const menuItems = useAccountHubMenuItems(hubRole);
  const { userGreetingName, userEmail, homeImageUri, profileInitials } = useSession();

  return (
    <ProfileScreenShell variant="hub">
      <AccountHubHeader
        displayName={userGreetingName}
        email={userEmail}
        avatarImageUri={homeImageUri}
        initials={profileInitials}
      />

      <View style={accountHubLayout.languageRow}>
        <LanguageSwitcher />
      </View>

      <View>
        <ProfileGlassCard style={accountHubLayout.menuCard}>
          {menuItems.map((item, index) => (
            <AccountHubMenuRow
              key={item.key}
              label={item.label}
              icon={item.icon}
              onPress={() => router.push(item.href)}
              showTopBorder={index > 0}
            />
          ))}
        </ProfileGlassCard>

        <ProfileHubMobileActionFooter />
      </View>
    </ProfileScreenShell>
  );
}
