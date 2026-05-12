import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSession } from "../../../src/auth/SessionProvider";
import { fontFamilies } from "../../../src/theme/fontFamilies";
import { colors, typography } from "../../../src/theme/tokens";

/**
 * Admin / content-admin home — route aligns with web `/admin/home`.
 */
export default function AdminHomeRoute() {
  const { isReady, isSignedIn } = useSession();

  if (!isReady) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.taupe} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/home" />;
  }

  return (
    <View style={styles.centered}>
      <Text style={styles.title} accessibilityRole="header">
        Studio admin
      </Text>
      <Text style={styles.subtitle}>
        You are signed in with an administrator role. Use the web dashboard for full
        back-office tools.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.canvas,
    paddingHorizontal: 24,
    justifyContent: "center",
    gap: 12,
  },
  title: {
    fontFamily: fontFamilies.newsreader.semiBoldItalic,
    fontSize: typography.sectionTitle + 8,
    color: colors.primaryGreen,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.secondarySage,
    textAlign: "center",
  },
});
