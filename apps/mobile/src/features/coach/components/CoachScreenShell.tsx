import type { ReactNode } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { AppHeader } from "../../../components/layout/AppHeader";
import { useAppHeaderBookPress } from "../../../components/layout/useAppHeaderBookPress";
import { useScreenChromeInsets } from "../../../components/layout/useScreenChrome";
import { GradientBackdrop } from "../../../components/layout/GradientBackdrop";
import { ScreenHeaderGapBackButton } from "../../../components/navigation/ScreenHeaderGapBackButton";
import { useRouter } from "expo-router";
import { useTranslations } from "../../../i18n/I18nProvider";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, space, typography } from "../../../theme/tokens";

type CoachScreenShellProps = {
  children?: ReactNode;
  title?: string;
  showHeader?: boolean;
  showBack?: boolean;
  loading?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

export function CoachScreenShell({
  children,
  title,
  showHeader = true,
  showBack = false,
  loading = false,
  contentStyle,
}: CoachScreenShellProps) {
  const router = useRouter();
  const tCommon = useTranslations("common");
  const onHeaderBookPress = useAppHeaderBookPress();
  const { paddingTop, paddingBottom, paddingLeft, paddingRight } =
    useScreenChromeInsets({
      header: showHeader ? "app" : "safe",
      headerContentGap: showBack && showHeader ? 0 : undefined,
    });

  return (
    <View style={styles.root}>
      <GradientBackdrop />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop, paddingBottom, paddingLeft, paddingRight },
          contentStyle,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {showBack || title ? (
          <View style={styles.pageHeader}>
            {showBack ? (
              <ScreenHeaderGapBackButton
                onPress={() => router.back()}
                accessibilityLabel={tCommon("account")}
              />
            ) : null}
            {title ? (
              <Text style={styles.title} accessibilityRole="header">
                {title}
              </Text>
            ) : null}
          </View>
        ) : null}
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.taupe} />
          </View>
        ) : (
          children ?? null
        )}
      </ScrollView>
      {showHeader ? <AppHeader onBookPress={onHeaderBookPress} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scrollContent: {
    gap: space.md,
  },
  pageHeader: {
    gap: 0,
  },
  title: {
    fontFamily: fontFamilies.gtSuperDs.mediumItalic,
    fontSize: typography.sectionTitle + 4,
    color: colors.primaryGreen,
    marginBottom: space.xs,
  },
  loading: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
  },
});
