import { Redirect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSession } from "../../src/auth/SessionProvider";
import { isValidEmail } from "../../src/auth/isValidEmail";
import { AuthPasswordInput } from "../../src/features/auth/components/AuthPasswordInput";
import { AuthScreenShell } from "../../src/features/auth/components/AuthScreenShell";
import { HeaderSpinningSphere } from "../../src/components/layout/HeaderSpinningSphere";
import { useIsCompactChrome } from "../../src/components/layout/useScreenChrome";
import { useTranslations } from "../../src/i18n/I18nProvider";
import { fontFamilies } from "../../src/theme/fontFamilies";
import { colors, radii, space, typography } from "../../src/theme/tokens";

const LOGIN_SPHERE_SIZE = 96;
const LOGIN_SPHERE_SIZE_COMPACT = 64;
const LOGIN_ENTRY_ANIMATION_MS = 760;
const LOGIN_ENTRY_OFFSET_PX = 16;
const LOGIN_ENTRY_START_SCALE = 0.985;
const LOGIN_ENTRY_EASING = Easing.bezier(0.22, 1, 0.36, 1);

export default function LoginRoute() {
  const router = useRouter();
  const compact = useIsCompactChrome();
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth.login");
  const tRegister = useTranslations("auth.register");
  const { isReady, isSignedIn, homeHref, signInWithPassword } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submitLockRef = useRef(false);
  const hasPlayedEntranceRef = useRef(false);
  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceTranslateY = useRef(new Animated.Value(LOGIN_ENTRY_OFFSET_PX)).current;
  const entranceScale = useRef(new Animated.Value(LOGIN_ENTRY_START_SCALE)).current;
  const sphereSize = compact ? LOGIN_SPHERE_SIZE_COMPACT : LOGIN_SPHERE_SIZE;

  useEffect(() => {
    if (!isReady || hasPlayedEntranceRef.current) {
      return;
    }

    hasPlayedEntranceRef.current = true;
    Animated.parallel([
      Animated.timing(entranceOpacity, {
        toValue: 1,
        duration: LOGIN_ENTRY_ANIMATION_MS,
        easing: LOGIN_ENTRY_EASING,
        useNativeDriver: true,
      }),
      Animated.timing(entranceTranslateY, {
        toValue: 0,
        duration: LOGIN_ENTRY_ANIMATION_MS,
        easing: LOGIN_ENTRY_EASING,
        useNativeDriver: true,
      }),
      Animated.timing(entranceScale, {
        toValue: 1,
        duration: LOGIN_ENTRY_ANIMATION_MS,
        easing: LOGIN_ENTRY_EASING,
        useNativeDriver: true,
      }),
    ]).start();
  }, [entranceOpacity, entranceScale, entranceTranslateY, isReady]);

  const onSubmit = useCallback(async () => {
    setFormError(null);
    if (busy || submitLockRef.current) {
      return;
    }
    if (!isValidEmail(email)) {
      setFormError(tRegister("invalidEmail"));
      return;
    }
    if (!password.trim()) {
      setFormError(tRegister("passwordRequired"));
      return;
    }

    submitLockRef.current = true;
    setBusy(true);
    try {
      const nextHref = await signInWithPassword(email, password);
      router.replace(nextHref);
    } catch (e) {
      const message = e instanceof Error ? e.message : tAuth("loginFailed");
      setFormError(message);
    } finally {
      setBusy(false);
      submitLockRef.current = false;
    }
  }, [busy, email, password, router, signInWithPassword, tAuth, tRegister]);

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
      <Animated.View
        style={[
          styles.contentBlock,
          {
            opacity: entranceOpacity,
            transform: [{ translateY: entranceTranslateY }, { scale: entranceScale }],
          },
        ]}
      >
        <View style={styles.brandBlock}>
          <HeaderSpinningSphere size={sphereSize} />
          <Text style={styles.title} accessibilityRole="header">
            {tCommon("login")}
          </Text>
          <Text style={styles.lead}>{tAuth("lead")}</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={tAuth("email")}
            placeholderTextColor={colors.bodyMuted}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="username"
            autoComplete="email"
            accessibilityLabel={tAuth("email")}
          />
          <AuthPasswordInput
            value={password}
            onChangeText={setPassword}
            placeholder={tAuth("password")}
            textContentType="password"
            autoComplete="password"
            accessibilityLabel={tAuth("password")}
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
            accessibilityLabel={tAuth("continue")}
            accessibilityState={{ disabled: busy }}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitLabel}>{tAuth("continue")}</Text>
            )}
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push("/register")}
          style={({ pressed }) => [styles.linkWrap, pressed && styles.linkPressed]}
          accessibilityRole="button"
          accessibilityLabel={tRegister("createAccount")}
        >
          <Text style={styles.linkText}>{tAuth("noAccountPrompt")} </Text>
          <Text style={styles.linkStrong}>{tCommon("register")}</Text>
        </Pressable>
      </Animated.View>
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
  contentBlock: {},
  brandBlock: {
    alignItems: "center",
    gap: space.md,
    marginBottom: space.sm,
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
