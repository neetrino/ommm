import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSession } from "../../src/auth/SessionProvider";
import { isValidEmail } from "../../src/auth/isValidEmail";
import { AuthScreenShell } from "../../src/features/auth/components/AuthScreenShell";
import { fontFamilies } from "../../src/theme/fontFamilies";
import { colors, radii, space, typography } from "../../src/theme/tokens";

const LOGIN_ICON_SIZE = 56;

export default function LoginRoute() {
  const router = useRouter();
  const { isReady, isSignedIn, signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = useCallback(async () => {
    setFormError(null);
    if (!isValidEmail(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!password.trim()) {
      setFormError("Please enter your password.");
      return;
    }

    setBusy(true);
    try {
      await signIn();
      router.replace("/home");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setFormError(message);
    } finally {
      setBusy(false);
    }
  }, [email, password, router, signIn]);

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
    <AuthScreenShell keyboardAware>
      <View style={styles.brandBlock}>
        <MaterialCommunityIcons
          name="lock-outline"
          size={LOGIN_ICON_SIZE}
          color={colors.primaryGreen}
          style={styles.icon}
          accessibilityIgnoresInvertColors
        />
        <Text style={styles.title} accessibilityRole="header">
          Sign in
        </Text>
        <Text style={styles.lead}>
          Enter your email and password to access your classes, schedule, and
          profile.
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.bodyMuted}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="username"
          autoComplete="email"
          accessibilityLabel="Email"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.bodyMuted}
          style={styles.input}
          secureTextEntry
          textContentType="password"
          autoComplete="password"
          accessibilityLabel="Password"
        />

        {formError ? <Text style={styles.formError}>{formError}</Text> : null}

        <Pressable
          onPress={() => void onSubmit()}
          disabled={busy}
          style={({ pressed }) => [
            styles.submit,
            pressed && !busy && styles.submitPressed,
            busy && styles.submitDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Sign in and continue"
          accessibilityState={{ disabled: busy }}
        >
          {busy ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitLabel}>Sign in</Text>
          )}
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.push("/register")}
        style={({ pressed }) => [styles.linkWrap, pressed && styles.linkPressed]}
        accessibilityRole="button"
        accessibilityLabel="Create a new account"
      >
        <Text style={styles.linkText}>New to the studio? </Text>
        <Text style={styles.linkStrong}>Create account</Text>
      </Pressable>
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
    marginBottom: space.sm,
  },
  icon: {
    opacity: 0.94,
    marginBottom: space.xs,
  },
  title: {
    fontFamily: fontFamilies.newsreader.semiBoldItalic,
    fontSize: typography.sectionTitle + 12,
    lineHeight: 36,
    color: colors.primaryGreen,
    textAlign: "center",
  },
  lead: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    lineHeight: 24,
    color: colors.secondarySage,
    textAlign: "center",
    maxWidth: 320,
    alignSelf: "center",
  },
  form: {
    gap: space.md,
    marginTop: space.xs,
  },
  input: {
    borderRadius: radii.labelCard,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.glassBorder,
    backgroundColor: colors.overlayWhite38,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    color: colors.primaryGreen,
  },
  formError: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.caption,
    lineHeight: 18,
    color: colors.danger,
  },
  submit: {
    alignSelf: "stretch",
    backgroundColor: colors.taupe,
    paddingVertical: space.md,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    marginTop: space.xs,
  },
  submitPressed: {
    opacity: 0.9,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  linkWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: space.lg,
    paddingVertical: space.sm,
  },
  linkPressed: {
    opacity: 0.85,
  },
  linkText: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.secondarySage,
  },
  linkStrong: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.primaryGreen,
  },
});
