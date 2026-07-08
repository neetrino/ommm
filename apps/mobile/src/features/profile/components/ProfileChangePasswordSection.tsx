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
import { profileSectionLayout } from "../profileSectionLayout";
import { ProfileGlassCard } from "./ProfileGlassCard";
import { colors, space } from "../../../theme/tokens";

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
    <ProfileGlassCard contentStyle={profileSectionLayout.sectionCard}>
      <Text style={profileSectionLayout.sectionLead}>
        Use a strong password you do not reuse elsewhere.
      </Text>

      <View style={styles.fieldGap}>
        <Text style={profileSectionLayout.fieldLabel}>Current password</Text>
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
        <Text style={profileSectionLayout.fieldLabel}>New password</Text>
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
        <Text style={profileSectionLayout.fieldLabel}>Confirm new password</Text>
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
          style={
            feedback.kind === "ok"
              ? profileSectionLayout.feedbackOk
              : profileSectionLayout.feedbackErr
          }
          accessibilityLiveRegion="polite"
        >
          {feedback.text}
        </Text>
      ) : null}

      <Pressable
        onPress={() => void onSubmit()}
        disabled={busy}
        style={({ pressed }) => [
          profileSectionLayout.primaryBtn,
          pressed && !busy && profileSectionLayout.primaryBtnPressed,
          busy && profileSectionLayout.primaryBtnDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Update password"
        accessibilityState={{ disabled: busy }}
      >
        {busy ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={profileSectionLayout.primaryBtnLabel}>Update password</Text>
        )}
      </Pressable>
    </ProfileGlassCard>
  );
}

const styles = StyleSheet.create({
  fieldGap: {
    gap: space.xs,
  },
});
