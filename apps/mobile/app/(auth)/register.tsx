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

const MIN_PASSWORD_LENGTH = 8;
const ACCOUNT_ICON_SIZE = 56;

export default function RegisterRoute() {
  const router = useRouter();
  const { isReady, isSignedIn, signIn } = useSession();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = useCallback(async () => {
    setFormError(null);
    const name = fullName.trim();
    if (name.length < 2) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!isValidEmail(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await signIn();
      router.replace("/user/home");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setFormError(message);
    } finally {
      setBusy(false);
    }
  }, [confirmPassword, email, fullName, password, router, signIn]);

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
    <AuthScreenShell keyboardAware>
      <View style={styles.brandBlock}>
        <MaterialCommunityIcons
          name="account-heart"
          size={ACCOUNT_ICON_SIZE}
          color={colors.primaryGreen}
          style={styles.icon}
          accessibilityIgnoresInvertColors
        />
        <Text style={styles.title} accessibilityRole="header">
          Create account
        </Text>
        <Text style={styles.lead}>
          Join the studio to book classes, follow your schedule, and manage your
          membership.
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Full name"
          placeholderTextColor={colors.bodyMuted}
          style={styles.input}
          autoCapitalize="words"
          autoCorrect={false}
          textContentType="name"
          accessibilityLabel="Full name"
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.bodyMuted}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          accessibilityLabel="Email"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.bodyMuted}
          style={styles.input}
          secureTextEntry
          textContentType="newPassword"
          accessibilityLabel="Password"
        />
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm password"
          placeholderTextColor={colors.bodyMuted}
          style={styles.input}
          secureTextEntry
          textContentType="newPassword"
          accessibilityLabel="Confirm password"
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
          accessibilityLabel="Create account and continue"
          accessibilityState={{ disabled: busy }}
        >
          {busy ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitLabel}>Sign up</Text>
          )}
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.replace("/login")}
        style={({ pressed }) => [styles.linkWrap, pressed && styles.linkPressed]}
        accessibilityRole="button"
        accessibilityLabel="Go to sign in"
      >
        <Text style={styles.linkText}>Already have an account? </Text>
        <Text style={styles.linkStrong}>Sign in</Text>
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
