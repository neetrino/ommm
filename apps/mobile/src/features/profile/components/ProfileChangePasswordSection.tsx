import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  isPasswordPolicyMet,
} from "../../../auth/passwordPolicy";
import { AuthPasswordInput } from "../../auth/components/AuthPasswordInput";
import { patchPassword } from "../../../lib/api/usersClient";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

export function ProfileChangePasswordSection() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);

  const onSubmit = useCallback(async () => {
    setFeedback(null);
    const c = current.trim();
    const n = next.trim();
    const conf = confirm.trim();
    if (!c || !n || !conf) {
      setFeedback({ kind: "err", text: "Please fill in all password fields." });
      return;
    }
    if (n !== conf) {
      setFeedback({ kind: "err", text: "New passwords do not match." });
      return;
    }
    if (!isPasswordPolicyMet(n)) {
      setFeedback({
        kind: "err",
        text: `Password must be ${PASSWORD_MIN_LENGTH}–${PASSWORD_MAX_LENGTH} characters.`,
      });
      return;
    }
    setBusy(true);
    try {
      await patchPassword({
        currentPassword: c,
        newPassword: n,
        confirmNewPassword: conf,
      });
      setFeedback({ kind: "ok", text: "Password updated successfully." });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setFeedback({ kind: "err", text: message });
    } finally {
      setBusy(false);
    }
  }, [confirm, current, next]);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Change password</Text>
      <Text style={styles.sectionLead}>
        Use a strong password you do not reuse elsewhere.
      </Text>

      <View style={styles.fieldGap}>
        <Text style={styles.label}>Current password</Text>
        <AuthPasswordInput
          value={current}
          onChangeText={setCurrent}
          placeholder="Current password"
          textContentType="password"
          autoComplete="password"
          accessibilityLabel="Current password"
        />
      </View>

      <View style={styles.fieldGap}>
        <Text style={styles.label}>New password</Text>
        <AuthPasswordInput
          value={next}
          onChangeText={setNext}
          placeholder="New password"
          textContentType="newPassword"
          autoComplete="password-new"
          accessibilityLabel="New password"
        />
      </View>

      <View style={styles.fieldGap}>
        <Text style={styles.label}>Confirm new password</Text>
        <AuthPasswordInput
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Confirm new password"
          textContentType="newPassword"
          autoComplete="password-new"
          accessibilityLabel="Confirm new password"
        />
      </View>

      {feedback ? (
        <Text
          style={feedback.kind === "ok" ? styles.feedbackOk : styles.feedbackErr}
          accessibilityLiveRegion="polite"
        >
          {feedback.text}
        </Text>
      ) : null}

      <Pressable
        onPress={() => void onSubmit()}
        disabled={busy}
        style={({ pressed }) => [
          styles.primaryBtn,
          pressed && !busy && styles.primaryBtnPressed,
          busy && styles.primaryBtnDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Update password"
        accessibilityState={{ disabled: busy }}
      >
        {busy ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.primaryBtnLabel}>Update password</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space.md,
    padding: space.lg,
    borderRadius: radii.labelCard,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    backgroundColor: colors.overlayWhite38,
  },
  sectionTitle: {
    fontFamily: fontFamilies.newsreader.semiBold,
    fontSize: typography.sectionTitle,
    color: colors.primaryGreen,
  },
  sectionLead: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    color: colors.secondarySage,
    marginBottom: space.xs,
  },
  fieldGap: {
    gap: space.xs,
  },
  label: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    color: colors.secondarySage,
  },
  feedbackOk: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.primaryGreen,
  },
  feedbackErr: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.danger,
  },
  primaryBtn: {
    marginTop: space.sm,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.lg,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryGreen,
  },
  primaryBtnPressed: {
    opacity: 0.9,
  },
  primaryBtnDisabled: {
    opacity: 0.65,
  },
  primaryBtnLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.body,
    color: colors.white,
  },
});
