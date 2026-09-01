import { StyleSheet, Text, View } from "react-native";
import { SCHEDULE_PAGE_MOBILE } from "../../../lib/schedule/schedulePageTokens";
import { fontFamilies } from "../../../theme/fontFamilies";
import { useScheduleCopy } from "../useScheduleCopy";
import { scheduleColors } from "../scheduleTokens";
import {
  ScheduleFilterField,
  type ScheduleFilterOption,
} from "./ScheduleFilterField";

type ScheduleFiltersHeaderProps = {
  monthLabel: string;
  classTypes: readonly string[];
  instructors: readonly string[];
  classTypeOptions: readonly ScheduleFilterOption[];
  instructorOptions: readonly ScheduleFilterOption[];
  onClassTypesChange: (values: string[]) => void;
  onInstructorsChange: (values: string[]) => void;
};

/**
 * Month + dual filter grid — mirrors web `monthFiltersRow` / `monthFiltersControls`
 * at the mobile breakpoint.
 */
export function ScheduleFiltersHeader({
  monthLabel,
  classTypes,
  instructors,
  classTypeOptions,
  instructorOptions,
  onClassTypesChange,
  onInstructorsChange,
}: ScheduleFiltersHeaderProps) {
  const scheduleCopy = useScheduleCopy();

  return (
    <View style={styles.row}>
      <Text style={styles.monthLabel}>{monthLabel}</Text>
      <View style={styles.controls}>
        <View style={styles.controlSlot}>
          <ScheduleFilterField
            values={classTypes}
            options={classTypeOptions}
            allLabel={scheduleCopy.filterClassTypeAll}
            applyLabel={scheduleCopy.filterApply}
            selectedCountLabel={scheduleCopy.filterSelectedCount}
            onChange={onClassTypesChange}
            accessibilityLabel={scheduleCopy.filterClassTypeAll}
          />
        </View>
        <View style={styles.controlSlot}>
          <ScheduleFilterField
            values={instructors}
            options={instructorOptions}
            allLabel={scheduleCopy.filterInstructorAll}
            applyLabel={scheduleCopy.filterApply}
            selectedCountLabel={scheduleCopy.filterSelectedCount}
            onChange={onInstructorsChange}
            accessibilityLabel={scheduleCopy.filterInstructorAll}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
    gap: SCHEDULE_PAGE_MOBILE.filtersGapPx,
  },
  monthLabel: {
    fontFamily: fontFamilies.gtSuperDs.mediumItalic,
    fontSize: 24,
    lineHeight: 26,
    letterSpacing: -0.48,
    color: scheduleColors.heading,
    textTransform: "capitalize",
  },
  controls: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  controlSlot: {
    flex: 1,
    minWidth: 0,
  },
});
