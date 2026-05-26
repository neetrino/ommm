import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLogoutAction } from "../../../src/auth/useLogoutAction";
import { GradientBackdrop } from "../../../src/components/layout/GradientBackdrop";
import { fontFamilies } from "../../../src/theme/fontFamilies";
import { colors, layout, radii, space, typography } from "../../../src/theme/tokens";

export default function AdminProfileMobileRoute() {
  const insets = useSafeAreaInsets();
  const logout = useLogoutAction();
  const [logoutBusy, setLogoutBusy] = useState(false);
  const bottomPad =
    layout.tabBarHeight + Math.max(insets.bottom, space.sm) + space.lg;

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
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>
          Manage your admin identity on the web dashboard for full details.
        </Text>
        <View style={styles.logoutSpacer} />
        <Pressable
          onPress={onLogoutPress}
          disabled={logoutBusy}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && !logoutBusy && styles.logoutButtonPressed,
            logoutBusy && styles.logoutButtonDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Logout"
          accessibilityHint="Signs out of your account"
          accessibilityState={{ disabled: logoutBusy }}
        >
          {logoutBusy ? (
            <ActivityIndicator color={colors.danger} />
          ) : (
            <MaterialCommunityIcons name="logout" size={20} color={colors.danger} />
          )}
          <Text style={styles.logoutLabel}>Logout</Text>
        </Pressable>
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
    gap: space.md,
  },
  title: {
    fontFamily: fontFamilies.newsreader.semiBoldItalic,
    fontSize: typography.sectionTitle + 6,
    lineHeight: 32,
    color: colors.primaryGreen,
  },
  subtitle: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.warmBrown,
    maxWidth: 320,
  },
  logoutSpacer: {
    flexGrow: 1,
    minHeight: space.md,
  },
  logoutButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
    minWidth: 120,
    minHeight: 52,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    backgroundColor: colors.overlayWhite38,
    borderRadius: radii.labelCard,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  logoutLabel: {
    fontFamily: fontFamilies.manrope.bold,
    fontSize: typography.body,
    color: colors.danger,
  },
  logoutButtonPressed: {
    opacity: 0.92,
  },
  logoutButtonDisabled: {
    opacity: 0.65,
  },
});
