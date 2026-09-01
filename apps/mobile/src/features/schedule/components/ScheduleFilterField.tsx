import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useBottomSheetSlideMotion } from "../../../hooks/useBottomSheetSlideMotion";
import { scheduleColors } from "../scheduleTokens";
import { scheduleFilterFieldStyles as styles } from "./scheduleFilterField.styles";

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
  const [presented, setPresented] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);
  const { backdropOpacity, sheetTranslateY, animateClose } =
    useBottomSheetSlideMotion(presented);

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
    setPresented(true);
  }

  function closeSheet() {
    animateClose(() => {
      setPresented(false);
    });
  }

  function applyAndClose() {
    const next = buildValidSelection(options, draft);
    animateClose(() => {
      setPresented(false);
      onChange(next);
    });
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
        style={({ pressed }) => [
          styles.trigger,
          pressed && styles.triggerPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ expanded: presented }}
      >
        <Text style={styles.label} numberOfLines={1}>
          {triggerLabel}
        </Text>
        <MaterialCommunityIcons
          name={presented ? "chevron-up" : "chevron-down"}
          size={20}
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
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            <ScrollView
              style={styles.optionsScroll}
              keyboardShouldPersistTaps="handled"
            >
              <Pressable
                onPress={selectAll}
                style={[
                  styles.option,
                  styles.optionFirst,
                  isAllSelected && styles.optionActive,
                ]}
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
          </Animated.View>
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
