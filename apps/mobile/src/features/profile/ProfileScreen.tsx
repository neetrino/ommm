import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useSession } from "../../auth/SessionProvider";
import { useLogoutAction } from "../../auth/useLogoutAction";
import { accountHubLayout } from "./accountHubLayout";
import { ACCOUNT_HUB_MENU_ITEMS } from "./accountHubMenu";
import { AccountHubHeader } from "./components/AccountHubHeader";
import { AccountHubMenuRow } from "./components/AccountHubMenuRow";
import { ProfileGlassCard } from "./components/ProfileGlassCard";
import { ProfileScreenShell } from "./components/ProfileScreenShell";
import { colors } from "../../theme/tokens";

export function ProfileScreen() {
  const router = useRouter();
  const logout = useLogoutAction();
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

      <ProfileGlassCard style={accountHubLayout.menuCard}>
        {ACCOUNT_HUB_MENU_ITEMS.map((item, index) => (
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
            label="Log out"
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
