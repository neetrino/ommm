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
import { useLogoutAction } from "../../auth/useLogoutAction";
import { GradientBackdrop } from "../../components/layout/GradientBackdrop";
import { fontFamilies } from "../../theme/fontFamilies";
import { colors, layout, radii, space, typography } from "../../theme/tokens";

const LOGOUT_ICON_SIZE = 20;

export function ProfileScreen() {
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
          accessibilityLabel="Log out"
          accessibilityState={{ disabled: logoutBusy }}
        >
          {logoutBusy ? (
            <ActivityIndicator color={colors.danger} />
          ) : (
            <>
              <MaterialCommunityIcons
                name="logout"
                size={LOGOUT_ICON_SIZE}
                color={colors.danger}
              />
              <Text style={styles.logoutLabel}>Log out</Text>
            </>
          )}
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
    gap: space.lg,
  },
  title: {
    fontFamily: fontFamilies.newsreader.semiBoldItalic,
    fontSize: typography.sectionTitle + 6,
    lineHeight: 32,
    color: colors.primaryGreen,
  },
  logoutSpacer: {
    flexGrow: 1,
    minHeight: space.lg,
  },
  logoutButton: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    backgroundColor: colors.overlayWhite38,
    borderRadius: radii.labelCard,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  logoutButtonPressed: {
    opacity: 0.92,
  },
  logoutButtonDisabled: {
    opacity: 0.65,
  },
  logoutLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.body,
    color: colors.danger,
  },
});
