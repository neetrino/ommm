import { ScrollView, StyleSheet, Text, View } from "react-native";
import { GradientBackdrop } from "../../components/layout/GradientBackdrop";
import { useScreenChromeInsets } from "../../components/layout/useScreenChrome";
import { fontFamilies } from "../../theme/fontFamilies";
import { colors, space, typography } from "../../theme/tokens";

type PlaceholderTabScreenProps = {
  title: string;
  subtitle: string;
};

export function PlaceholderTabScreen({
  title,
  subtitle,
}: PlaceholderTabScreenProps) {
  const { paddingTop, paddingBottom, paddingLeft, paddingRight } =
    useScreenChromeInsets({
      header: "safe",
      contentGap: space.lg,
    });

  return (
    <View style={styles.root}>
      <GradientBackdrop />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop, paddingBottom, paddingLeft, paddingRight },
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
    gap: space.md,
  },
  title: {
    fontFamily: fontFamilies.gtSuperDs.mediumItalic,
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
