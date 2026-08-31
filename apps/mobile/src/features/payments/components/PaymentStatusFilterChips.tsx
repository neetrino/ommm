import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslations } from "../../../i18n/I18nProvider";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, space, typography } from "../../../theme/tokens";

export type PaymentStatusFilter = "SUCCEEDED" | "FAILED" | "PENDING";

const FILTER_OPTIONS: readonly {
  value: PaymentStatusFilter;
  labelKey: "SUCCEEDED" | "FAILED" | "PENDING";
}[] = [
  { value: "SUCCEEDED", labelKey: "SUCCEEDED" },
  { value: "FAILED", labelKey: "FAILED" },
  { value: "PENDING", labelKey: "PENDING" },
] as const;

type PaymentStatusFilterChipsProps = {
  value: PaymentStatusFilter | null;
  onChange: (next: PaymentStatusFilter | null) => void;
};

/** Status chips that filter the member payments list. */
export function PaymentStatusFilterChips({
  value,
  onChange,
}: PaymentStatusFilterChipsProps) {
  const t = useTranslations("userPages.payments");

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t("filters.status")}</Text>
      <View style={styles.row}>
        {FILTER_OPTIONS.map((option) => {
          const active = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(active ? null : option.value)}
              style={({ pressed }) => [
                styles.chip,
                active && styles.chipActive,
                pressed && styles.chipPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t(`status.${option.labelKey}`)}
            >
              <Text
                style={[styles.chipLabel, active && styles.chipLabelActive]}
              >
                {t(`status.${option.labelKey}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: space.xs,
  },
  title: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.ink,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.xs,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: colors.taupe,
  },
  chipActive: {
    backgroundColor: colors.ink,
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 12,
    color: colors.white,
  },
  chipLabelActive: {
    color: colors.white,
  },
});
