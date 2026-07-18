import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import {
  MEMBER_PROFILE_AVATAR_FILL,
  MEMBER_PROFILE_AVATAR_INITIALS_COLOR,
  memberProfileAvatarInitialsFontSize,
} from "../../profile/memberProfileAvatarTokens";
import { useIsCompactChrome } from "../../../components/layout/useScreenChrome";
import { useTranslations } from "../../../i18n/I18nProvider";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, layout, radii, space } from "../../../theme/tokens";

type UserGreetingSectionProps = {
  /** Full name or fallback from session (e.g. email local-part). */
  displayName: string;
  /** Same custom photo as Home banner; fills the circular avatar when set. */
  avatarImageUri?: string | null;
  /** Shown inside the avatar when no custom photo is set. */
  avatarInitials?: string;
  /**
   * When false, skip horizontal padding (parent shell already pads).
   * Default true for member home where sections pad themselves.
   */
  insetHorizontal?: boolean;
};

export function UserGreetingSection({
  displayName,
  avatarImageUri,
  avatarInitials,
  insetHorizontal = true,
}: UserGreetingSectionProps) {
  const tDashboard = useTranslations("account.dashboard");
  const compact = useIsCompactChrome();

  return (
    <View
      style={[
        styles.row,
        compact ? styles.rowCompact : null,
        insetHorizontal ? styles.rowInset : null,
      ]}
    >
      <View style={styles.leftCluster}>
        <View style={styles.avatarTilt}>
          <View style={styles.avatarRing}>
            {avatarImageUri ? (
              <Image
                source={{ uri: avatarImageUri }}
                style={styles.avatarImage}
                contentFit="cover"
                accessibilityLabel="Your Home photo"
              />
            ) : avatarInitials ? (
              <View style={styles.avatarInitialsShell}>
                <Text style={styles.avatarInitialsText}>{avatarInitials}</Text>
              </View>
            ) : (
              <View
                style={styles.avatarFill}
                accessibilityLabel="Profile avatar placeholder"
              />
            )}
          </View>
        </View>
        <View style={styles.welcomeBlock}>
          <Text style={styles.welcomeLine}>{tDashboard("greeting")}</Text>
          <Text style={styles.welcomeLine} numberOfLines={1}>
            {displayName}
          </Text>
        </View>
      </View>
      <View style={[styles.headlineBlock, compact ? styles.headlineBlockCompact : null]}>
        <Text style={styles.headlinePlain} numberOfLines={1}>
          Find your bookings
        </Text>
        <Text style={styles.headlineAccent} numberOfLines={1}>
          for today.
        </Text>
      </View>
    </View>
  );
}

const AVATAR = layout.avatarSize;
const AVATAR_INITIALS_SIZE = memberProfileAvatarInitialsFontSize(AVATAR);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    marginBottom: space.section,
  },
  rowCompact: {
    flexWrap: "wrap",
    alignItems: "flex-start",
    marginBottom: space.md,
  },
  rowInset: {
    paddingHorizontal: space.screenHorizontal - 6,
  },
  leftCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm + 4,
    flexShrink: 0,
  },
  avatarTilt: {
    transform: [{ rotate: "3deg" }],
  },
  avatarRing: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    borderWidth: 2,
    borderColor: colors.white,
    padding: 2,
    overflow: "hidden",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFill: {
    width: "100%",
    height: "100%",
    borderRadius: AVATAR / 2,
    backgroundColor: MEMBER_PROFILE_AVATAR_FILL,
  },
  avatarInitialsShell: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: AVATAR / 2,
    backgroundColor: MEMBER_PROFILE_AVATAR_FILL,
  },
  avatarInitialsText: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: AVATAR_INITIALS_SIZE,
    lineHeight: AVATAR_INITIALS_SIZE + 4,
    color: MEMBER_PROFILE_AVATAR_INITIALS_COLOR,
    textAlign: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: AVATAR / 2,
    backgroundColor: MEMBER_PROFILE_AVATAR_FILL,
  },
  welcomeBlock: {
    justifyContent: "center",
    maxWidth: 140,
  },
  welcomeLine: {
    fontFamily: fontFamilies.gtSuperDs.regularItalic,
    fontSize: 16,
    lineHeight: 18,
    color: colors.secondarySage,
  },
  headlineBlock: {
    flex: 1,
    minWidth: 0,
  },
  headlineBlockCompact: {
    flexBasis: "100%",
    marginTop: space.xs,
  },
  headlinePlain: {
    fontFamily: fontFamilies.gtSuperDs.regular,
    fontSize: 16,
    lineHeight: 16,
    color: colors.primaryGreen,
  },
  headlineAccent: {
    fontFamily: fontFamilies.gtSuperDs.lightItalic,
    fontSize: 16,
    lineHeight: 16,
    color: colors.primaryGreen,
  },
});
