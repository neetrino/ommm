import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomSheetSlideMotion } from "../../../hooks/useBottomSheetSlideMotion";
import { useTranslations } from "../../../i18n/I18nProvider";
import { space } from "../../../theme/tokens";
import { scheduleColors } from "../../schedule/scheduleTokens";
import { paymentStatusFilterDropdownStyles as styles } from "./paymentStatusFilterDropdown.styles";

export type PaymentStatusFilter = "SUCCEEDED" | "FAILED" | "PENDING";

type StatusTone = "success" | "failed" | "pending" | "neutral";

type StatusOption = {
  value: PaymentStatusFilter;
  tone: Exclude<StatusTone, "neutral">;
};

const STATUS_OPTIONS: readonly StatusOption[] = [
  { value: "SUCCEEDED", tone: "success" },
  { value: "FAILED", tone: "failed" },
  { value: "PENDING", tone: "pending" },
] as const;

const TONE_DOT: Record<StatusTone, string> = {
  neutral: "rgba(151, 144, 124, 0.55)",
  success: "#16a34a",
  failed: "#dc2626",
  pending: "#d97706",
};

const CHECKBOX_SIZE = 22;

type PaymentStatusFilterDropdownProps = {
  /** Empty array = all statuses (default). */
  value: readonly PaymentStatusFilter[];
  onChange: (next: PaymentStatusFilter[]) => void;
};

function sanitizeStatuses(
  values: readonly PaymentStatusFilter[],
): PaymentStatusFilter[] {
  const allowed = new Set<PaymentStatusFilter>(
    STATUS_OPTIONS.map((option) => option.value),
  );
  return values.filter((value) => allowed.has(value));
}

function toneForStatus(status: PaymentStatusFilter): StatusTone {
  return (
    STATUS_OPTIONS.find((option) => option.value === status)?.tone ?? "neutral"
  );
}

/** Multi-select status filter; empty selection means all statuses. */
export function PaymentStatusFilterDropdown({
  value,
  onChange,
}: PaymentStatusFilterDropdownProps) {
  const t = useTranslations("userPages.payments");
  const tSchedule = useTranslations("marketingPages.schedule");
  const insets = useSafeAreaInsets();
  const [presented, setPresented] = useState(false);
  const [draft, setDraft] = useState<PaymentStatusFilter[]>([]);
  const { backdropOpacity, sheetTranslateY, animateClose } =
    useBottomSheetSlideMotion(presented);

  function closeSheet() {
    animateClose(() => {
      setPresented(false);
    });
  }

  const committed = useMemo(() => sanitizeStatuses(value), [value]);
  const draftSelected = useMemo(() => sanitizeStatuses(draft), [draft]);
  const isAllSelected = draftSelected.length === 0;

  const triggerLabel = useMemo(() => {
    if (committed.length === 0) return t("filters.allStatuses");
    if (committed.length === 1) return t(`status.${committed[0]}`);
    return tSchedule("filterSelectedCount", { count: committed.length });
  }, [committed, t, tSchedule]);

  const triggerTone: StatusTone =
    committed.length === 1 ? toneForStatus(committed[0]) : "neutral";

  function openSheet() {
    setDraft(sanitizeStatuses(value));
    setPresented(true);
  }

  function selectAll() {
    setDraft([]);
  }

  function toggleStatus(status: PaymentStatusFilter) {
    setDraft((prev) => {
      const next = new Set(sanitizeStatuses(prev));
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return [...next];
    });
  }

  function applyAndClose() {
    const next = sanitizeStatuses(draft);
    animateClose(() => {
      setPresented(false);
      onChange(next);
    });
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.fieldLabel}>{t("filters.status")}</Text>

      <Pressable
        onPress={openSheet}
        style={({ pressed }) => [
          styles.trigger,
          presented && styles.triggerOpen,
          pressed && styles.triggerPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={t("filters.status")}
        accessibilityState={{ expanded: presented }}
      >
        <View style={styles.triggerLeft}>
          {committed.length > 1 ? (
            <View style={styles.multiDots}>
              {committed.map((status) => (
                <View
                  key={status}
                  style={[
                    styles.toneDot,
                    { backgroundColor: TONE_DOT[toneForStatus(status)] },
                  ]}
                />
              ))}
            </View>
          ) : (
            <View
              style={[
                styles.toneDot,
                { backgroundColor: TONE_DOT[triggerTone] },
              ]}
            />
          )}
          <Text style={styles.triggerLabel} numberOfLines={1}>
            {triggerLabel}
          </Text>
        </View>
        <MaterialCommunityIcons
          name={presented ? "chevron-up" : "chevron-down"}
          size={22}
          color={scheduleColors.oliveActive}
        />
      </Pressable>

      <Modal
        visible={presented}
        transparent
        animationType="none"
        onRequestClose={closeSheet}
      >
        <View style={styles.backdropRoot}>
          <Animated.View
            pointerEvents="none"
            style={[styles.backdropFill, { opacity: backdropOpacity }]}
          />
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeSheet}
            accessibilityRole="button"
          />
          <Animated.View
            style={[
              styles.sheet,
              {
                paddingBottom: Math.max(insets.bottom, space.sm) + space.lg,
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            <Text style={styles.sheetTitle}>{t("filters.status")}</Text>

            <View style={styles.options}>
              <OptionRow
                label={t("filters.allStatuses")}
                tone="neutral"
                active={isAllSelected}
                onPress={selectAll}
              />
              {STATUS_OPTIONS.map((option) => (
                <OptionRow
                  key={option.value}
                  label={t(`status.${option.value}`)}
                  tone={option.tone}
                  active={draftSelected.includes(option.value)}
                  onPress={() => toggleStatus(option.value)}
                />
              ))}
            </View>

            <Pressable
              onPress={applyAndClose}
              style={({ pressed }) => [
                styles.applyButton,
                pressed && styles.applyButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={tSchedule("filterApply")}
            >
              <Text style={styles.applyLabel}>{tSchedule("filterApply")}</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

function OptionRow({
  label,
  tone,
  active,
  onPress,
}: {
  label: string;
  tone: StatusTone;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        active && styles.optionActive,
        pressed && styles.optionPressed,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: active }}
      accessibilityLabel={label}
    >
      <View
        style={[styles.toneDotLarge, { backgroundColor: TONE_DOT[tone] }]}
      />
      <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
        {label}
      </Text>
      <MaterialCommunityIcons
        name={active ? "checkbox-marked" : "checkbox-blank-outline"}
        size={CHECKBOX_SIZE}
        color={
          active ? scheduleColors.oliveActive : scheduleColors.filterBorder
        }
      />
    </Pressable>
  );
}
