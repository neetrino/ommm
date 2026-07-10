import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSession } from "../../src/auth/SessionProvider";
import { isValidEmail } from "../../src/auth/isValidEmail";
import { AuthPasswordInput } from "../../src/features/auth/components/AuthPasswordInput";
import { AuthScreenShell } from "../../src/features/auth/components/AuthScreenShell";
import { useTranslations, useLocale } from "../../src/i18n/I18nProvider";
import { formatPhoneInput } from "../../src/lib/phone-input";
import { fontFamilies } from "../../src/theme/fontFamilies";
import { colors, radii, space, typography } from "../../src/theme/tokens";

const MIN_PASSWORD_LENGTH = 8;
const ACCOUNT_ICON_SIZE = 56;
const MIN_PHONE_DIGITS = 8;
const MAX_PHONE_DIGITS = 15;
const MAX_PHONE_CHARS = 32;

function countDigits(value: string): number {
  return (value.match(/\d/g) ?? []).length;
}

function isValidPhone(trimmed: string): boolean {
  if (trimmed.length < MIN_PHONE_DIGITS || trimmed.length > MAX_PHONE_CHARS) {
    return false;
  }
  const digits = countDigits(trimmed);
  return digits >= MIN_PHONE_DIGITS && digits <= MAX_PHONE_DIGITS;
}

export default function RegisterRoute() {
  const router = useRouter();
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth.register");
  const { isReady, isSignedIn, homeHref, registerAccount } = useSession();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submitLockRef = useRef(false);

  const onSubmit = useCallback(async () => {
    setFormError(null);
    if (busy || submitLockRef.current) {
      return;
    }
    const given = firstName.trim();
    const family = lastName.trim();
    const phoneTrim = phone.trim();
    if (given.length < 1) {
      setFormError(tAuth("firstNameRequired"));
      return;
    }
    if (family.length < 1) {
      setFormError(tAuth("lastNameRequired"));
      return;
    }
    if (phoneTrim.length < 1) {
      setFormError(tAuth("phoneRequired"));
      return;
    }
    if (!isValidPhone(phoneTrim)) {
      setFormError(tAuth("invalidPhone"));
      return;
    }
    if (!isValidEmail(email)) {
      setFormError(tAuth("invalidEmail"));
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(tAuth("passwordTooShort", { min: MIN_PASSWORD_LENGTH }));
      return;
    }
    if (password !== confirmPassword) {
      setFormError(tAuth("passwordMismatch"));
      return;
    }

    submitLockRef.current = true;
    setBusy(true);
    try {
      const nextHref = await registerAccount({
        email,
        password,
        name: given,
        lastName: family,
        phone: phoneTrim,
        locale,
      });
      router.replace(nextHref);
    } catch (e) {
      const message = e instanceof Error ? e.message : tAuth("registerFailed");
      setFormError(message);
    } finally {
      setBusy(false);
      submitLockRef.current = false;
    }
  }, [busy, confirmPassword, email, firstName, lastName, locale, password, phone, registerAccount, router, tAuth]);

  if (isReady && isSignedIn) {
    return <Redirect href={homeHref} />;
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
          {tAuth("createAccount")}
        </Text>
        <Text style={styles.lead}>{tAuth("lead")}</Text>
      </View>

      <View style={styles.formSection}>
        <View style={styles.form}>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder={tAuth("firstName")}
            placeholderTextColor={colors.bodyMuted}
            style={styles.input}
            autoCapitalize="words"
            autoCorrect={false}
            textContentType="givenName"
            accessibilityLabel={tAuth("firstName")}
          />
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder={tAuth("lastName")}
            placeholderTextColor={colors.bodyMuted}
            style={styles.input}
            autoCapitalize="words"
            autoCorrect={false}
            textContentType="familyName"
            accessibilityLabel={tAuth("lastName")}
          />
          <TextInput
            value={phone}
            onChangeText={(value) => setPhone(formatPhoneInput(value))}
            placeholder={tAuth("phone")}
            placeholderTextColor={colors.bodyMuted}
            style={styles.input}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            accessibilityLabel={tAuth("phone")}
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={tAuth("email")}
            placeholderTextColor={colors.bodyMuted}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            accessibilityLabel={tAuth("email")}
          />
          <AuthPasswordInput
            value={password}
            onChangeText={setPassword}
            placeholder={tAuth("password")}
            textContentType="newPassword"
            autoComplete="password-new"
            accessibilityLabel={tAuth("password")}
          />
          <AuthPasswordInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={tAuth("confirmPassword")}
            textContentType="newPassword"
            autoComplete="password-new"
            accessibilityLabel={tAuth("confirmPassword")}
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
            accessibilityLabel={tAuth("createAccount")}
            accessibilityState={{ disabled: busy }}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitLabel}>{tAuth("createAccount")}</Text>
            )}
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.replace("/login")}
          style={({ pressed }) => [styles.linkWrap, pressed && styles.linkPressed]}
          accessibilityRole="button"
          accessibilityLabel={tCommon("login")}
        >
          <Text style={styles.linkText}>{tAuth("alreadyHavePrompt")} </Text>
          <Text style={styles.linkStrong}>{tCommon("login")}</Text>
        </Pressable>
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
    marginBottom: space.sm,
  },
  icon: {
    opacity: 0.94,
    marginBottom: space.xs,
  },
  title: {
    fontFamily: fontFamilies.gtSuperDs.mediumItalic,
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
  formSection: {
    gap: space.sm,
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
    paddingVertical: space.xxs,
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
