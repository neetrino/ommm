import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useSession } from "../../auth/SessionProvider";
import { useLogoutAction } from "../../auth/useLogoutAction";
import { LanguageSwitcher } from "../../i18n/LanguageSwitcher";
import { useTranslations } from "../../i18n/I18nProvider";
import { accountHubLayout } from "./accountHubLayout";
import { useAccountHubMenuItems } from "./accountHubMenu";
import { AccountHubHeader } from "./components/AccountHubHeader";
import { AccountHubMenuRow } from "./components/AccountHubMenuRow";
import { ProfileGlassCard } from "./components/ProfileGlassCard";
import { ProfileScreenShell } from "./components/ProfileScreenShell";
import { colors } from "../../theme/tokens";

export function ProfileScreen() {
  const router = useRouter();
  const logout = useLogoutAction();
  const tCommon = useTranslations("common");
  const menuItems = useAccountHubMenuItems();
  const { userGreetingName, userEmail, homeImageUri, profileInitials } = useSession();
  const [logoutBusy, setLogoutBusy] = useState(false);

  const onLogoutPress = useCallback(() => {
    if (logoutBusy) {
      return;
    }
    setLogoutBusy(true);
    void logout().finally(() => {
      setLogoutBusy(false);
    });
  }, [logout, logoutBusy]);

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

        {logoutBusy ? (
          <View style={accountHubLayout.logoutRow}>
            <ActivityIndicator color={colors.danger} />
          </View>
        ) : (
          <AccountHubMenuRow
            label={tCommon("logout")}
            icon="logout"
            onPress={onLogoutPress}
            danger
            showIcon={false}
          />
        )}
      </ProfileGlassCard>
    </ProfileScreenShell>
  );
}
