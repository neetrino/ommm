import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslations } from "../../../i18n/I18nProvider";
import { fontFamilies } from "../../../theme/fontFamilies";
import { platformShadow } from "../../../theme/platformShadow";
import { colors, radii, space, typography } from "../../../theme/tokens";
import { scheduleColors } from "../../schedule/scheduleTokens";

export type PaymentStatusFilter = "SUCCEEDED" | "FAILED" | "PENDING";

type StatusOption = {
  value: PaymentStatusFilter | null;
  labelKey: "all" | PaymentStatusFilter;
  tone: "neutral" | "success" | "failed" | "pending";
};

const STATUS_OPTIONS: readonly StatusOption[] = [
  { value: null, labelKey: "all", tone: "neutral" },
  { value: "SUCCEEDED", labelKey: "SUCCEEDED", tone: "success" },
  { value: "FAILED", labelKey: "FAILED", tone: "failed" },
  { value: "PENDING", labelKey: "PENDING", tone: "pending" },
] as const;

const TONE_DOT: Record<StatusOption["tone"], string> = {
  neutral: "rgba(151, 144, 124, 0.55)",
  success: "#16a34a",
  failed: "#dc2626",
  pending: "#d97706",
};

type PaymentStatusFilterDropdownProps = {
  value: PaymentStatusFilter | null;
  onChange: (next: PaymentStatusFilter | null) => void;
};

/** Single-select status filter for the member payments list. */
export function PaymentStatusFilterDropdown({
  value,
  onChange,
}: PaymentStatusFilterDropdownProps) {
  const t = useTranslations("userPages.payments");
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () =>
      STATUS_OPTIONS.find((option) => option.value === value) ??
      STATUS_OPTIONS[0],
    [value],
  );

  const triggerLabel =
    selected.labelKey === "all"
      ? t("filters.allStatuses")
      : t(`status.${selected.labelKey}`);

  function close() {
    setOpen(false);
  }

  function select(next: PaymentStatusFilter | null) {
    onChange(next);
    setOpen(false);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.fieldLabel}>{t("filters.status")}</Text>

      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          open && styles.triggerOpen,
          pressed && styles.triggerPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={t("filters.status")}
        accessibilityState={{ expanded: open }}
      >
        <View style={styles.triggerLeft}>
          <View
            style={[
              styles.toneDot,
              { backgroundColor: TONE_DOT[selected.tone] },
            ]}
          />
          <Text style={styles.triggerLabel} numberOfLines={1}>
            {triggerLabel}
          </Text>
        </View>
        <MaterialCommunityIcons
          name={open ? "chevron-up" : "chevron-down"}
          size={22}
          color={scheduleColors.oliveActive}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel={t("filters.status")}
          />
          <View
            style={[
              styles.sheet,
              {
                paddingBottom:
                  Math.max(insets.bottom, space.sm) + space.lg,
              },
            ]}
          >
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{t("filters.status")}</Text>

            <View style={styles.options}>
              {STATUS_OPTIONS.map((option) => {
                const active = option.value === value;
                const label =
                  option.labelKey === "all"
                    ? t("filters.allStatuses")
                    : t(`status.${option.labelKey}`);
                return (
                  <Pressable
                    key={option.labelKey}
                    onPress={() => select(option.value)}
                    style={({ pressed }) => [
                      styles.option,
                      active && styles.optionActive,
                      pressed && styles.optionPressed,
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={label}
                  >
                    <View
                      style={[
                        styles.toneDotLarge,
                        { backgroundColor: TONE_DOT[option.tone] },
                      ]}
                    />
                    <Text
                      style={[
                        styles.optionLabel,
                        active && styles.optionLabelActive,
                      ]}
                    >
                      {label}
                    </Text>
                    {active ? (
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color={scheduleColors.oliveActive}
                      />
                    ) : (
                      <View style={styles.checkSpacer} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: space.xs,
  },
  fieldLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    letterSpacing: 0.2,
    color: colors.ink,
  },
  trigger: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
    borderRadius: radii.labelCard,
    borderWidth: 1,
    borderColor: scheduleColors.filterBorder,
    backgroundColor: scheduleColors.filterBg,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    ...platformShadow({
      color: "#2d2823",
      offsetHeight: 8,
      opacity: 0.1,
      radius: 16,
      elevation: 2,
    }),
  },
  triggerOpen: {
    borderColor: "rgba(105, 95, 0, 0.45)",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
  },
  triggerPressed: {
    opacity: 0.92,
  },
  triggerLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  triggerLabel: {
    flex: 1,
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    letterSpacing: 0.28,
    color: scheduleColors.body,
  },
  toneDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
  },
  toneDotLarge: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: colors.scrimDark,
  },
  sheet: {
    zIndex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.canvas,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    gap: space.md,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: scheduleColors.shellBorder,
    ...platformShadow({
      color: "#2d2823",
      offsetHeight: -8,
      opacity: 0.14,
      radius: 24,
      elevation: 10,
    }),
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: "rgba(151, 144, 124, 0.35)",
  },
  sheetTitle: {
    fontFamily: fontFamilies.gtSuperDs.medium,
    fontSize: typography.sectionTitle,
    color: scheduleColors.heading,
  },
  options: {
    gap: space.xs,
  },
  option: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(151, 144, 124, 0.22)",
    backgroundColor: "rgba(255,255,255,0.72)",
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  optionActive: {
    borderColor: "rgba(105, 95, 0, 0.35)",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    ...platformShadow({
      color: "#2d2823",
      offsetHeight: 6,
      opacity: 0.08,
      radius: 12,
      elevation: 2,
    }),
  },
  optionPressed: {
    opacity: 0.9,
  },
  optionLabel: {
    flex: 1,
    fontFamily: fontFamilies.manrope.regular,
    fontSize: 15,
    color: scheduleColors.body,
  },
  optionLabelActive: {
    fontFamily: fontFamilies.manrope.semiBold,
    color: scheduleColors.oliveActive,
  },
  checkSpacer: {
    width: 20,
    height: 20,
  },
});
