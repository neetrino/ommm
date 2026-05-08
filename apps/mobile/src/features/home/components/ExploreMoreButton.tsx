import { Pressable, StyleSheet, Text } from "react-native";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

type ExploreMoreButtonProps = {
  onPress?: () => void;
};

export function ExploreMoreButton({ onPress }: ExploreMoreButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Explore more content"
    >
      <Text style={styles.label}>Explore More</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "stretch",
    marginHorizontal: space.screenHorizontal,
    backgroundColor: colors.taupeButton,
    paddingHorizontal: space.xl,
    paddingVertical: space.sm + 4,
    borderRadius: radii.pill,
    marginBottom: space.section,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.92,
  },
  label: {
    fontFamily: fontFamilies.newsreader.regularItalic,
    fontSize: typography.sectionTitle,
    lineHeight: 24,
    color: colors.white,
    textAlign: "center",
  },
});
