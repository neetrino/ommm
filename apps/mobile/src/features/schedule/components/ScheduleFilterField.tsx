import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fontFamilies } from "../../../theme/fontFamilies";
import { platformShadow } from "../../../theme/platformShadow";
import { scheduleColors } from "../scheduleTokens";

export type ScheduleFilterOption = {
  value: string;
  label: string;
};

type ScheduleFilterFieldProps = {
  values: readonly string[];
  options: readonly ScheduleFilterOption[];
  allLabel: string;
  applyLabel: string;
  selectedCountLabel: (count: number) => string;
  onChange: (values: string[]) => void;
  accessibilityLabel: string;
};

const CHECKBOX_SIZE = 20;

function buildValidSelection(
  options: readonly ScheduleFilterOption[],
  values: readonly string[],
): string[] {
  const valid = new Set(options.map((option) => option.value));
  return values.filter((value) => valid.has(value));
}

export function ScheduleFilterField({
  values,
  options,
  allLabel,
  applyLabel,
  selectedCountLabel,
  onChange,
  accessibilityLabel,
}: ScheduleFilterFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);

  const committed = useMemo(
    () => buildValidSelection(options, values),
    [options, values],
  );
  const draftSelected = useMemo(
    () => buildValidSelection(options, draft),
    [draft, options],
  );
  const isAllSelected = draftSelected.length === 0;
  const committedOptions = useMemo(
    () => options.filter((option) => committed.includes(option.value)),
    [committed, options],
  );

  const triggerLabel =
    committed.length === 0
      ? allLabel
      : committedOptions.length === 1
        ? (committedOptions[0]?.label ?? allLabel)
        : selectedCountLabel(committedOptions.length);

  function openSheet() {
    setDraft(buildValidSelection(options, values));
    setOpen(true);
  }

  function closeSheet() {
    setOpen(false);
  }

  function applyAndClose() {
    onChange(buildValidSelection(options, draft));
    setOpen(false);
  }

  function selectAll() {
    setDraft([]);
  }

  function toggleOption(value: string) {
    setDraft((prev) => {
      const next = new Set(buildValidSelection(options, prev));
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return [...next];
    });
  }

  return (
    <>
      <Pressable
        onPress={openSheet}
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ expanded: open }}
      >
        <Text style={styles.label} numberOfLines={1}>
          {triggerLabel}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={20}
          color={scheduleColors.oliveActive}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={closeSheet}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeSheet}
            accessibilityRole="button"
          />
          <View style={styles.sheet}>
            <ScrollView
              style={styles.optionsScroll}
              keyboardShouldPersistTaps="handled"
            >
              <Pressable
                onPress={selectAll}
                style={[styles.option, isAllSelected && styles.optionActive]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isAllSelected }}
              >
                <FilterCheckbox checked={isAllSelected} />
                <Text
                  style={[
                    styles.optionLabel,
                    isAllSelected && styles.optionLabelActive,
                  ]}
                >
                  {allLabel}
                </Text>
              </Pressable>

              {options.map((option) => {
                const active = draftSelected.includes(option.value);
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => toggleOption(option.value)}
                    style={[styles.option, active && styles.optionActive]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: active }}
                  >
                    <FilterCheckbox checked={active} />
                    <Text
                      style={[
                        styles.optionLabel,
                        active && styles.optionLabelActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.footer}>
              <Pressable
                onPress={applyAndClose}
                style={({ pressed }) => [
                  styles.applyButton,
                  pressed && styles.applyButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={applyLabel}
              >
                <Text style={styles.applyLabel}>{applyLabel}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function FilterCheckbox({ checked }: { checked: boolean }) {
  return (
    <MaterialCommunityIcons
      name={checked ? "checkbox-marked" : "checkbox-blank-outline"}
      size={CHECKBOX_SIZE}
      color={
        checked ? scheduleColors.oliveActive : scheduleColors.filterBorder
      }
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: scheduleColors.filterBorder,
    backgroundColor: scheduleColors.filterBg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...platformShadow({
      color: "#2d2823",
      offsetHeight: 8,
      opacity: 0.1,
      radius: 16,
      elevation: 2,
    }),
  },
  triggerPressed: {
    opacity: 0.92,
  },
  label: {
    flex: 1,
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 14,
    letterSpacing: 0.28,
    color: scheduleColors.body,
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  sheet: {
    zIndex: 1,
    maxHeight: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#ffffff",
    paddingTop: 8,
    overflow: "hidden",
  },
  optionsScroll: {
    flexGrow: 0,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  optionActive: {
    backgroundColor: "rgba(151, 144, 124, 0.12)",
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
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(151, 144, 124, 0.28)",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  applyButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: scheduleColors.olive,
    ...platformShadow({
      color: "#2d2823",
      offsetHeight: 8,
      opacity: 0.16,
      radius: 14,
      elevation: 3,
    }),
  },
  applyButtonPressed: {
    opacity: 0.9,
  },
  applyLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 14,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: scheduleColors.canvasText,
  },
});
