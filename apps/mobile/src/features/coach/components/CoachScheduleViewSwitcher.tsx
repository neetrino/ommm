import { Pressable, StyleSheet, Text, View } from "react-native";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";
import {
  COACH_SCHEDULE_VIEW_MODES,
  type CoachScheduleViewMode,
} from "../lib/coachScheduleView";

type CoachScheduleViewSwitcherProps = {
  value: CoachScheduleViewMode;
  labels: Record<CoachScheduleViewMode, string>;
  ariaLabel: string;
  onChange: (view: CoachScheduleViewMode) => void;
};

export function CoachScheduleViewSwitcher({
  value,
  labels,
  ariaLabel,
  onChange,
}: CoachScheduleViewSwitcherProps) {
  return (
    <View style={styles.row} accessibilityRole="tablist" accessibilityLabel={ariaLabel}>
      {COACH_SCHEDULE_VIEW_MODES.map((mode) => {
        const active = value === mode;
        return (
          <Pressable
            key={mode}
            onPress={() => onChange(mode)}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={labels[mode]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{labels[mode]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: space.sm,
  },
  chip: {
    minHeight: 40,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.white,
    paddingHorizontal: space.md,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: colors.primaryGreen,
    borderColor: colors.primaryGreen,
  },
  label: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.secondarySage,
  },
  labelActive: {
    color: colors.white,
  },
});
