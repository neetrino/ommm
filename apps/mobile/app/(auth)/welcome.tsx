import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSession } from "../../src/auth/SessionProvider";
import { AuthPillButtonStack } from "../../src/features/auth/components/AuthPillButtonStack";
import { AuthScreenShell } from "../../src/features/auth/components/AuthScreenShell";
import { fontFamilies } from "../../src/theme/fontFamilies";
import { colors, space, typography } from "../../src/theme/tokens";

const MEDITATION_ICON_SIZE = 64;

export default function WelcomeRoute() {
  const router = useRouter();
  const { isReady, isSignedIn } = useSession();

  if (isReady && isSignedIn) {
    return <Redirect href="/user/home" />;
  }

  if (!isReady) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.taupe} />
      </View>
    );
  }

  return (
    <AuthScreenShell>
      <View style={styles.brandBlock}>
        <MaterialCommunityIcons
          name="meditation"
          size={MEDITATION_ICON_SIZE}
          color={colors.primaryGreen}
          style={styles.icon}
          accessibilityIgnoresInvertColors
        />
        <Text style={styles.title} accessibilityRole="header">
          Welcome
        </Text>
        <Text style={styles.lead}>
          Sign in to continue to your classes, schedule, and profile.
        </Text>
      </View>

      <View style={styles.actions}>
        <AuthPillButtonStack
          onSignInPress={() => router.push("/login")}
          onCreateAccountPress={() => router.push("/register")}
        />
      </View>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
  },
  brandBlock: {
    alignItems: "center",
    gap: space.md,
  },
  icon: {
    opacity: 0.94,
    marginBottom: space.xs,
  },
  title: {
    fontFamily: fontFamilies.newsreader.semiBoldItalic,
    fontSize: typography.sectionTitle + 14,
    lineHeight: 40,
    color: colors.primaryGreen,
    textAlign: "center",
  },
  lead: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body + 1,
    lineHeight: 26,
    color: colors.secondarySage,
    textAlign: "center",
    maxWidth: 320,
    alignSelf: "center",
  },
  actions: {
    marginTop: space.sm,
    width: "100%",
    alignItems: "center",
  },
});
