import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { readStoredAccessToken } from "../../../auth/accessTokenStorage";
import { useTranslations } from "../../../i18n/I18nProvider";
import { redeemGiftCard } from "../../../lib/api/giftCardsClient";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";
import { PackagesPrimaryCta } from "../../packages/components/PackagesScreenActions";

/** Member enters a gift code. The balance stays on the card until this succeeds. */
export function GiftRedeemForm({ onRedeemed }: { onRedeemed: () => void }) {
  const t = useTranslations("userPages.giftCards.redeemForm");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <View style={styles.box}>
      <Text style={styles.title}>{t("title")}</Text>
      <TextInput
        value={code}
        autoCapitalize="characters"
        placeholder={t("codePlaceholder")}
        placeholderTextColor={colors.taupe}
        style={styles.input}
        onChangeText={setCode}
      />
      {notice !== null ? <Text style={styles.notice}>{notice}</Text> : null}
      <PackagesPrimaryCta
        label={busy ? t("submitting") : t("submit")}
        onPress={() => {
          void submitCode(code, t("success"), t("failed"), setBusy, setNotice, () => {
            setCode("");
            onRedeemed();
          });
        }}
      />
    </View>
  );
}

async function submitCode(
  code: string,
  successLabel: string,
  failedLabel: string,
  setBusy: (value: boolean) => void,
  setNotice: (value: string) => void,
  onDone: () => void,
): Promise<void> {
  setBusy(true);
  try {
    const token = await readStoredAccessToken();
    if (token === null) {
      setNotice(failedLabel);
      return;
    }
    await redeemGiftCard(token, code.trim());
    setNotice(successLabel);
    onDone();
  } catch (error) {
    setNotice(error instanceof Error ? error.message : failedLabel);
  } finally {
    setBusy(false);
  }
}

const styles = StyleSheet.create({
  box: { gap: space.sm, marginBottom: space.md },
  title: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.body,
    color: colors.ink,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radii.labelCard,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    color: colors.ink,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
  },
  notice: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.caption,
    color: colors.ink,
  },
});
