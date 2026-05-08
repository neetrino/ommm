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
    alignSelf: "center",
    backgroundColor: colors.taupeButton,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm + 2,
    borderRadius: radii.pill,
    marginBottom: space.section,
  },
  pressed: {
    opacity: 0.92,
  },
  label: {
    fontFamily: fontFamilies.newsreader.mediumItalic,
    fontSize: typography.sectionTitle,
    lineHeight: 24,
    color: colors.white,
  },
});
