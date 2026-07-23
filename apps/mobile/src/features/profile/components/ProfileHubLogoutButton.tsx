import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { useLogoutAction } from "../../../auth/useLogoutAction";
import { useTranslations } from "../../../i18n/I18nProvider";
import { fontFamilies } from "../../../theme/fontFamilies";
import { platformShadow } from "../../../theme/platformShadow";
import { memberAccountHubActionTokens } from "../memberAccountHubActionTokens";

const tokens = memberAccountHubActionTokens.logoutBtn;

export function ProfileHubLogoutButton() {
  const logout = useLogoutAction();
  const tCommon = useTranslations("common");
  const [busy, setBusy] = useState(false);

  const onPress = useCallback(() => {
    if (busy) {
      return;
    }
    setBusy(true);
    void logout().finally(() => {
      setBusy(false);
    });
  }, [busy, logout]);

  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => [
        styles.logoutBtn,
        pressed && !busy && styles.logoutBtnPressed,
        busy && styles.logoutBtnDisabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={tCommon("logout")}
      accessibilityState={{ disabled: busy, busy }}
    >
      {busy ? (
        <ActivityIndicator size="small" color={tokens.labelColor} />
      ) : (
        <MaterialCommunityIcons
          name="logout"
          size={tokens.iconSize}
          color={tokens.labelColor}
        />
      )}
      <Text style={styles.logoutBtnLabel}>{tCommon("logout")}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  logoutBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.gap,
    borderRadius: tokens.borderRadius,
    backgroundColor: tokens.backgroundColor,
    paddingVertical: tokens.paddingVertical,
    paddingHorizontal: tokens.paddingHorizontal,
    ...platformShadow({
      color: tokens.shadowColor,
      offsetWidth: tokens.shadowOffset.width,
      offsetHeight: tokens.shadowOffset.height,
      opacity: tokens.shadowOpacity,
      radius: tokens.shadowRadius,
      elevation: 3,
    }),
  },
  logoutBtnPressed: {
    transform: [{ scale: tokens.pressedScale }],
  },
  logoutBtnDisabled: {
    opacity: tokens.disabledOpacity,
  },
  logoutBtnLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: tokens.labelSize,
    lineHeight: tokens.labelLineHeight,
    color: tokens.labelColor,
  },
});
