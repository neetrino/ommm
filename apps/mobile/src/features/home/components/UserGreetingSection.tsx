import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, layout, radii, space } from "../../../theme/tokens";

type UserGreetingSectionProps = {
  /** Full name or fallback from session (e.g. email local-part). */
  displayName: string;
  /** Same custom photo as Home banner; fills the circular avatar when set. */
  avatarImageUri?: string | null;
};

export function UserGreetingSection({
  displayName,
  avatarImageUri,
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
  },
  avatarFill: {
    flex: 1,
    borderRadius: radii.pill,
    backgroundColor: colors.taupe,
  },
  avatarImage: {
    flex: 1,
    borderRadius: radii.pill,
    backgroundColor: colors.taupe,
  },
  welcomeBlock: {
    justifyContent: "center",
  },
  welcomeLine: {
    fontFamily: fontFamilies.newsreader.regularItalic,
    fontSize: 16,
    lineHeight: 18,
    color: colors.secondarySage,
  },
  headlineBlock: {
    flex: 1,
    minWidth: 0,
  },
  headlinePlain: {
    fontFamily: fontFamilies.newsreader.regular,
    fontSize: 16,
    lineHeight: 16,
    color: colors.primaryGreen,
  },
  headlineAccent: {
    fontFamily: fontFamilies.newsreader.lightItalic,
    fontSize: 16,
    lineHeight: 16,
    color: colors.primaryGreen,
  },
});
