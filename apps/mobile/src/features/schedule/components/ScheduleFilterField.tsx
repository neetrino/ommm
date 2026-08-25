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
  selectedCountLabel,
  onChange,
  accessibilityLabel,
}: ScheduleFilterFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(
    () => buildValidSelection(options, values),
    [options, values],
  );
  const isAllSelected = selected.length === 0;
  const selectedOptions = useMemo(
    () => options.filter((option) => selected.includes(option.value)),
    [options, selected],
  );

  const triggerLabel = isAllSelected
    ? allLabel
    : selectedOptions.length === 1
      ? (selectedOptions[0]?.label ?? allLabel)
      : selectedCountLabel(selectedOptions.length);

  function selectAll() {
    onChange([]);
  }

  function toggleOption(value: string) {
    const next = new Set(selected);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    onChange([...next]);
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
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
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
            accessibilityRole="button"
          />
          <View style={styles.sheet}>
            <ScrollView keyboardShouldPersistTaps="handled">
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
                const active = selected.includes(option.value);
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
    paddingVertical: 8,
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
});
