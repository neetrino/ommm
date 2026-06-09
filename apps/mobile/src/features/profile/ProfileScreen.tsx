import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "../../auth/SessionProvider";
import { useLogoutAction } from "../../auth/useLogoutAction";
import { GradientBackdrop } from "../../components/layout/GradientBackdrop";
import { accountHubLayout } from "./accountHubLayout";
import { ACCOUNT_HUB_MENU_ITEMS } from "./accountHubMenu";
import { AccountHubHeader } from "./components/AccountHubHeader";
import { AccountHubMenuRow } from "./components/AccountHubMenuRow";
import { colors, layout, space } from "../../theme/tokens";

function buildInitials(displayName: string, email: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }
  const one = parts[0]?.[0] ?? email[0] ?? "M";
  return one.toUpperCase();
}

export function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const logout = useLogoutAction();
  const { userGreetingName, userEmail, homeImageUri } = useSession();
  const [logoutBusy, setLogoutBusy] = useState(false);

  const bottomPad =
    layout.tabBarHeight + Math.max(insets.bottom, space.sm) + space.lg;

  const initials = useMemo(
    () => buildInitials(userGreetingName, userEmail),
    [userEmail, userGreetingName],
  );

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
    <View style={styles.root}>
      <GradientBackdrop />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        keyboardShouldPersistTaps="handled"
      >
        <AccountHubHeader
          displayName={userGreetingName}
          email={userEmail}
          avatarImageUri={homeImageUri}
          initials={initials}
        />

        <View style={accountHubLayout.menuCard}>
          {ACCOUNT_HUB_MENU_ITEMS.map((item) => (
            <AccountHubMenuRow
              key={item.key}
              label={item.label}
              icon={item.icon}
              onPress={() => router.push(item.href)}
              isLast={false}
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
              isLast
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: space.screenHorizontal,
    paddingTop: space.xxl,
    gap: space.xl,
  },
});
