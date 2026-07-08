import { Pressable, StyleSheet, Text } from "react-native";
import { useTranslations } from "../../../i18n/I18nProvider";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

type ExploreMoreButtonProps = {
  onPress?: () => void;
};

export function ExploreMoreButton({ onPress }: ExploreMoreButtonProps) {
  const t = useTranslations("home.explore");

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={t("exploreMore")}
    >
      <Text style={styles.label}>{t("exploreMore")}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "stretch",
    marginHorizontal: space.screenHorizontal + space.xxl + space.xxl,
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
    fontFamily: fontFamilies.gtSuperDs.regularItalic,
    fontSize: typography.sectionTitle,
    lineHeight: 24,
    color: colors.white,
    textAlign: "center",
  },
});
