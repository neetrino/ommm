import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
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
  value: string;
  options: readonly ScheduleFilterOption[];
  onChange: (value: string) => void;
  accessibilityLabel: string;
};

export function ScheduleFilterField({
  value,
  options,
  onChange,
  accessibilityLabel,
}: ScheduleFilterFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Text style={styles.label} numberOfLines={1}>
          {selected?.label ?? value}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color={scheduleColors.oliveActive} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <ScrollView keyboardShouldPersistTaps="handled">
              {options.map((option) => {
                const active = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    style={[styles.option, active && styles.optionActive]}
                  >
                    <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
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
    maxHeight: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#ffffff",
    paddingVertical: 8,
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  optionActive: {
    backgroundColor: "rgba(151, 144, 124, 0.12)",
  },
  optionLabel: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: 15,
    color: scheduleColors.body,
  },
  optionLabelActive: {
    fontFamily: fontFamilies.manrope.semiBold,
    color: scheduleColors.oliveActive,
  },
});
