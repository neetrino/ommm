import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTranslations } from "../../../i18n/I18nProvider";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

type GiftRedeemFormProps = {
  code: string;
  onChangeCode: (value: string) => void;
  busy: boolean;
  message: { kind: "ok" | "err"; text: string } | null;
  onSubmit: () => void;
};

export function GiftRedeemForm({
  code,
  onChangeCode,
  busy,
  message,
  onSubmit,
}: GiftRedeemFormProps) {
  const t = useTranslations("userPages.giftCards.redeemForm");

  return (
    <View style={styles.wrap}>
      <Text style={styles.lead}>{t("lead")}</Text>
      <Text style={styles.label}>{t("codeLabel")}</Text>
      <TextInput
        value={code}
        onChangeText={onChangeCode}
        placeholder={t("codePlaceholder")}
        placeholderTextColor={colors.bodyMuted}
        autoCapitalize="characters"
        autoCorrect={false}
        editable={!busy}
        style={styles.input}
        accessibilityLabel={t("codeLabel")}
      />
      {message !== null ? (
        <Text
          style={message.kind === "ok" ? styles.ok : styles.err}
          accessibilityLiveRegion="polite"
        >
          {message.text}
        </Text>
      ) : null}
      <Pressable
        onPress={onSubmit}
        disabled={busy}
        style={({ pressed }) => [
          styles.button,
          pressed && !busy && styles.pressed,
          busy && styles.disabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel={t("submit")}
      >
        {busy ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonLabel}>{t("submit")}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: space.sm,
    padding: space.lg,
    borderRadius: radii.labelCard,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.white,
  },
  lead: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    color: colors.bodyMuted,
  },
  label: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    color: colors.ink,
  },
  input: {
    minHeight: 48,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.canvas,
    paddingHorizontal: space.md,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.body,
    color: colors.ink,
  },
  ok: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.primaryGreen,
  },
  err: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.danger,
  },
  button: {
    alignSelf: "flex-start",
    minHeight: 44,
    paddingHorizontal: space.lg,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.taupe,
  },
  pressed: {
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.55,
  },
  buttonLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
