import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSession } from "../../../auth/SessionProvider";
import { useTranslations } from "../../../i18n/I18nProvider";
import { deleteAccount } from "../../../lib/api/usersClient";
import { fontFamilies } from "../../../theme/fontFamilies";
import { memberAccountHubActionTokens } from "../memberAccountHubActionTokens";

const HOME_HREF = "/home" as const;
const tokens = memberAccountHubActionTokens.deleteBtn;

export function DeleteAccountHubButton() {
  const router = useRouter();
  const { role, signOut } = useSession();
  const tProfile = useTranslations("userPages.profile");
  const [busy, setBusy] = useState(false);

  const confirmDelete = useCallback(async () => {
    setBusy(true);
    try {
      await deleteAccount();
      await signOut();
      router.replace(HOME_HREF);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : tProfile("deleteAccountFailed");
      Alert.alert(tProfile("deleteAccount"), message);
    } finally {
      setBusy(false);
    }
  }, [router, signOut, tProfile]);

  const onDeletePress = useCallback(() => {
    if (busy) {
      return;
    }
    Alert.alert(
      tProfile("deleteAccountConfirmTitle"),
      tProfile("deleteAccountConfirmDescription"),
      [
        {
          text: tProfile("deleteAccountConfirmNo"),
          style: "cancel",
        },
        {
          text: tProfile("deleteAccountConfirmYes"),
          style: "destructive",
          onPress: () => void confirmDelete(),
        },
      ],
    );
  }, [busy, confirmDelete, tProfile]);

  if (role === "COACH") {
    return null;
  }

  const label = busy ? tProfile("deleteAccountDeleting") : tProfile("deleteAccount");

  return (
    <Pressable
      onPress={onDeletePress}
      disabled={busy}
      style={({ pressed }) => [
        styles.deleteBtn,
        pressed && !busy && styles.deleteBtnPressed,
        busy && styles.deleteBtnDisabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: busy, busy }}
    >
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={tokens.iconSize}
          color={tokens.iconColor}
        />
      </View>

      <Text style={styles.deleteBtnLabel}>{label}</Text>

      <MaterialCommunityIcons
        name="chevron-right"
        size={tokens.chevronSize}
        color={tokens.chevronColor}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  deleteBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.gap,
    borderRadius: tokens.borderRadius,
    borderWidth: 1,
    borderColor: tokens.borderColor,
    backgroundColor: tokens.backgroundColor,
    paddingVertical: tokens.paddingVertical,
    paddingHorizontal: tokens.paddingHorizontal,
    ...Platform.select({
      ios: {
        shadowColor: tokens.shadowColor,
        shadowOffset: tokens.shadowOffset,
        shadowOpacity: tokens.shadowOpacity,
        shadowRadius: tokens.shadowRadius,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  deleteBtnPressed: {
    transform: [{ scale: tokens.pressedScale }],
  },
  deleteBtnDisabled: {
    opacity: tokens.disabledOpacity,
  },
  iconWrap: {
    width: tokens.iconWrapSize,
    height: tokens.iconWrapSize,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnLabel: {
    flex: 1,
    minWidth: 0,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: tokens.labelSize,
    lineHeight: tokens.labelLineHeight,
    color: tokens.labelColor,
  },
});
