import { Image } from "expo-image";
import { Redirect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { figmaRemoteAssets } from "../../src/assets/figmaRemoteAssets";
import { useSession } from "../../src/auth/SessionProvider";
import { isValidEmail } from "../../src/auth/isValidEmail";
import { AuthBackToHomeRow, AUTH_BACK_TO_HOME_TOP_RESERVE } from "../../src/features/auth/components/AuthBackToHomeRow";
import { AuthPasswordInput } from "../../src/features/auth/components/AuthPasswordInput";
import { AuthScreenShell } from "../../src/features/auth/components/AuthScreenShell";
import { useTranslations } from "../../src/i18n/I18nProvider";
import { fontFamilies } from "../../src/theme/fontFamilies";
import { colors, radii, space, typography } from "../../src/theme/tokens";

const LOGIN_LOGO_LAYOUT_SIZE = 72;
/** Visual scale only — layout slot stays fixed so other elements do not move. */
const LOGIN_LOGO_VISUAL_SCALE = 3.35;
/** Balance AuthScreenShell top reserve vs bottom inset when vertically centering. */
const AUTH_SHELL_VERTICAL_PADDING_BIAS =
  (AUTH_BACK_TO_HOME_TOP_RESERVE - space.xl) / 2;
/** Locked to scale 3 overflow so logo size tweaks do not shift the form block. */
const LOGIN_CONTENT_LIFT =
  (LOGIN_LOGO_LAYOUT_SIZE * (3 - 1)) / 2 + AUTH_SHELL_VERTICAL_PADDING_BIAS;

export default function LoginRoute() {
  const router = useRouter();
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth.login");
  const tRegister = useTranslations("auth.register");
  const { isReady, isSignedIn, homeHref, signInWithPassword } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submitLockRef = useRef(false);

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
    <AuthScreenShell
      keyboardAware
      topLeading={<AuthBackToHomeRow onPress={() => router.replace("/home")} />}
    >
      <View style={styles.contentBlock}>
        <View style={styles.brandBlock}>
          <View style={styles.logoSlot}>
            <Image
              source={figmaRemoteAssets.brandMark}
              style={styles.logo}
              contentFit="contain"
              accessibilityLabel="Ommm logo"
              accessibilityIgnoresInvertColors
            />
          </View>
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
  contentBlock: {
    marginTop: -LOGIN_CONTENT_LIFT,
  },
  brandBlock: {
    alignItems: "center",
    gap: space.md,
    marginBottom: space.sm,
  },
  logoSlot: {
    width: LOGIN_LOGO_LAYOUT_SIZE,
    height: LOGIN_LOGO_LAYOUT_SIZE,
    marginBottom: space.xs,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  logo: {
    width: LOGIN_LOGO_LAYOUT_SIZE,
    height: LOGIN_LOGO_LAYOUT_SIZE,
    transform: [{ scale: LOGIN_LOGO_VISUAL_SCALE }],
    opacity: 0.94,
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
