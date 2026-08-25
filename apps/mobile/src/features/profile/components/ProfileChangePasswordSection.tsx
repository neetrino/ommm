import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  isPasswordPolicyMet,
} from "../../../auth/passwordPolicy";
import { AuthPasswordInput } from "../../auth/components/AuthPasswordInput";
import { PackagesPrimaryCta } from "../../packages/components/PackagesScreenActions";
import { patchPassword } from "../../../lib/api/usersClient";
import { useTranslations } from "../../../i18n/I18nProvider";
import { profileSectionLayout } from "../profileSectionLayout";
import { ProfileGlassCard } from "./ProfileGlassCard";
import { space } from "../../../theme/tokens";

export function ProfileChangePasswordSection() {
  const tChange = useTranslations("forms.changePassword");
  const tProfileEdit = useTranslations("forms.profileEdit");
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
      setFeedback({ kind: "err", text: tChange("fillAllFields") });
      return;
    }
    if (n !== conf) {
      setFeedback({ kind: "err", text: tChange("mismatch") });
      return;
    }
    if (!isPasswordPolicyMet(n)) {
      setFeedback({
        kind: "err",
        text: tChange("lengthConstraint", {
          min: PASSWORD_MIN_LENGTH,
          max: PASSWORD_MAX_LENGTH,
        }),
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
      setFeedback({ kind: "ok", text: tProfileEdit("saveSuccess") });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : tChange("failed");
      setFeedback({ kind: "err", text: message });
    } finally {
      setBusy(false);
    }
  }, [confirm, current, next, tChange, tProfileEdit]);

  return (
    <ProfileGlassCard contentStyle={profileSectionLayout.sectionCard}>
      <View style={styles.fieldGap}>
        <Text style={profileSectionLayout.fieldLabel}>
          {tChange("currentPasswordLabel")}
        </Text>
        <AuthPasswordInput
          value={current}
          onChangeText={setCurrent}
          placeholder={tChange("currentPasswordLabel")}
          textContentType="password"
          autoComplete="password"
          accessibilityLabel={tChange("currentPasswordLabel")}
        />
      </View>

      <View style={styles.fieldGap}>
        <Text style={profileSectionLayout.fieldLabel}>
          {tChange("newPasswordLabel")}
        </Text>
        <AuthPasswordInput
          value={next}
          onChangeText={setNext}
          placeholder={tChange("newPasswordLabel")}
          textContentType="newPassword"
          autoComplete="password-new"
          accessibilityLabel={tChange("newPasswordLabel")}
        />
      </View>

      <View style={styles.fieldGap}>
        <Text style={profileSectionLayout.fieldLabel}>
          {tChange("confirmPasswordLabel")}
        </Text>
        <AuthPasswordInput
          value={confirm}
          onChangeText={setConfirm}
          placeholder={tChange("confirmPasswordLabel")}
          textContentType="newPassword"
          autoComplete="password-new"
          accessibilityLabel={tChange("confirmPasswordLabel")}
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

      <PackagesPrimaryCta
        label={busy ? tProfileEdit("saving") : tChange("updateButton")}
        onPress={() => {
          if (!busy) {
            void onSubmit();
          }
        }}
      />
    </ProfileGlassCard>
  );
}

const styles = StyleSheet.create({
  fieldGap: {
    gap: space.xs,
  },
});
