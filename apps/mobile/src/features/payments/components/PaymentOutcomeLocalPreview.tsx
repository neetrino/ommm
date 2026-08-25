import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { buildPaymentOutcomeHref } from "../../../lib/payments/paymentResultPaths";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, space, typography } from "../../../theme/tokens";

const PREVIEW_REFERENCE = "LOCAL-PREVIEW-REF";

/** Dev-only shortcuts to open payment outcome screens locally. */
export function PaymentOutcomeLocalPreview() {
  const router = useRouter();

  if (!__DEV__) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Local payment screens</Text>
      <Text style={styles.lead}>
        Open success / fail / pending UI without Arca (dev only).
      </Text>
      <View style={styles.row}>
        <PreviewChip
          label="Success"
          onPress={() =>
            router.push(
              buildPaymentOutcomeHref("success", {
                reference: PREVIEW_REFERENCE,
                source: "package",
              }),
            )
          }
        />
        <PreviewChip
          label="Fail"
          onPress={() =>
            router.push(
              buildPaymentOutcomeHref("failed", {
                reference: PREVIEW_REFERENCE,
                source: "gift",
              }),
            )
          }
        />
        <PreviewChip
          label="Pending"
          onPress={() =>
            router.push(
              buildPaymentOutcomeHref("pending", {
                reference: PREVIEW_REFERENCE,
                source: "dropin",
              }),
            )
          }
        />
      </View>
    </View>
  );
}

function PreviewChip({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.chipLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: space.xs,
    padding: space.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(151, 144, 124, 0.35)",
    borderStyle: "dashed",
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  title: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.ink,
  },
  lead: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.caption,
    color: colors.bodyMuted,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.xs,
    marginTop: space.xs,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: colors.taupe,
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 12,
    color: colors.white,
  },
});
