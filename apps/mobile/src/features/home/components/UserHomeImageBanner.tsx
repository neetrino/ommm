import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { colors, radii, shadows, space } from "../../../theme/tokens";

const BANNER_ASPECT = 4 / 5;

type UserHomeImageBannerProps = {
  uri: string | null;
};

export function UserHomeImageBanner({ uri }: UserHomeImageBannerProps) {
  if (uri === null || uri === "") {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={[styles.card, shadows.exploreHero]}>
        <Image
          source={{ uri }}
          style={styles.image}
          contentFit="cover"
          accessibilityRole="image"
          accessibilityLabel="Your Home image"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: space.screenHorizontal,
    marginBottom: space.section,
  },
  card: {
    width: "100%",
    borderRadius: radii.header,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    backgroundColor: colors.primaryGreen,
  },
  image: {
    width: "100%",
    aspectRatio: BANNER_ASPECT,
  },
});
