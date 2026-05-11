import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientBackdrop } from "../../src/components/layout/GradientBackdrop";
import { useSession } from "../../src/auth/SessionProvider";
import { fontFamilies } from "../../src/theme/fontFamilies";
import { colors, radii, space, typography } from "../../src/theme/tokens";

export default function WelcomeRoute() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isReady, isSignedIn, signIn } = useSession();

  const onContinue = useCallback(async () => {
    await signIn();
    router.replace("/home");
  }, [router, signIn]);

  if (isReady && isSignedIn) {
    return <Redirect href="/home" />;
  }

  if (!isReady) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.taupe} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <GradientBackdrop />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + space.xxl,
            paddingBottom: insets.bottom + space.xl,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="meditation"
          size={56}
          color={colors.primaryGreen}
          style={styles.icon}
        />
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.lead}>
          Sign in to continue to your classes, schedule, and profile.
        </Text>
        <Pressable
          onPress={() => void onContinue()}
          style={({ pressed }) => [
            styles.primaryCta,
            pressed && styles.primaryCtaPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Sign in and continue to the app"
        >
          <Text style={styles.primaryCtaLabel}>Sign in</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
  },
  content: {
    flex: 1,
    paddingHorizontal: space.screenHorizontal,
    justifyContent: "center",
    gap: space.lg,
  },
  icon: {
    alignSelf: "center",
    marginBottom: space.sm,
    opacity: 0.92,
  },
  title: {
    fontFamily: fontFamilies.newsreader.semiBoldItalic,
    fontSize: typography.sectionTitle + 10,
    lineHeight: 36,
    color: colors.primaryGreen,
    textAlign: "center",
  },
  lead: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.warmBrown,
    textAlign: "center",
    marginBottom: space.md,
  },
  primaryCta: {
    alignSelf: "stretch",
    backgroundColor: colors.taupe,
    paddingVertical: space.sm + 4,
    paddingHorizontal: space.xl,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryCtaPressed: {
    opacity: 0.9,
  },
  primaryCtaLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
