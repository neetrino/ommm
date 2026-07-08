import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, layout, radii, space } from "../../../theme/tokens";

type UserGreetingSectionProps = {
  /** Full name or fallback from session (e.g. email local-part). */
  displayName: string;
  /** Same custom photo as Home banner; fills the circular avatar when set. */
  avatarImageUri?: string | null;
  /** Shown inside the avatar when no custom photo is set. */
  avatarInitials?: string;
};

export function UserGreetingSection({
  displayName,
  avatarImageUri,
  avatarInitials,
}: UserGreetingSectionProps) {
  return (
    <View style={styles.row}>
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
          <Text style={styles.welcomeLine}>Welcome back,</Text>
          <Text style={styles.welcomeLine}>{displayName}</Text>
        </View>
      </View>
      <View style={styles.headlineBlock}>
        <Text style={styles.headlinePlain}>Find your</Text>
        <Text style={styles.headlineAccent}>center today.</Text>
      </View>
    </View>
  );
}

const AVATAR = layout.avatarSize;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.screenHorizontal - 6,
    marginBottom: space.section,
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
    borderRadius: radii.pill,
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
    borderRadius: radii.pill,
    backgroundColor: colors.taupe,
  },
  avatarInitialsShell: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    backgroundColor: "rgba(212,163,115,0.22)",
  },
  avatarInitialsText: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 20,
    lineHeight: 24,
    color: colors.primaryGreen,
    textAlign: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: radii.pill,
    backgroundColor: colors.taupe,
  },
  welcomeBlock: {
    justifyContent: "center",
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
