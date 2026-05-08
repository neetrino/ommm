import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackdrop } from "../../components/layout/GradientBackdrop";
import { fontFamilies } from "../../theme/fontFamilies";
import { colors, layout, space, typography } from "../../theme/tokens";

type PlaceholderTabScreenProps = {
  title: string;
  subtitle?: string;
};

export function PlaceholderTabScreen({
  title,
  subtitle = "This section will connect to the API when endpoints are available.",
}: PlaceholderTabScreenProps) {
  const insets = useSafeAreaInsets();
  const bottomPad =
    layout.tabBarHeight + Math.max(insets.bottom, space.sm) + space.lg;

  return (
    <View style={styles.root}>
      <GradientBackdrop />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPad },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
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
    gap: space.md,
  },
  title: {
    fontFamily: fontFamilies.newsreader.semiBoldItalic,
    fontSize: typography.sectionTitle + 6,
    lineHeight: 32,
    color: colors.primaryGreen,
  },
  subtitle: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.warmBrown,
    maxWidth: 320,
  },
});
