import { StyleSheet, View } from "react-native";
import { useScheduleCopy } from "../useScheduleCopy";
import {
  ScheduleFilterField,
  type ScheduleFilterOption,
} from "./ScheduleFilterField";

type ScheduleFiltersHeaderProps = {
  classTypes: readonly string[];
  instructors: readonly string[];
  classTypeOptions: readonly ScheduleFilterOption[];
  instructorOptions: readonly ScheduleFilterOption[];
  onClassTypesChange: (values: string[]) => void;
  onInstructorsChange: (values: string[]) => void;
};

export function ScheduleFiltersHeader({
  classTypes,
  instructors,
  classTypeOptions,
  instructorOptions,
  onClassTypesChange,
  onInstructorsChange,
}: ScheduleFiltersHeaderProps) {
  const scheduleCopy = useScheduleCopy();

  return (
    <View style={styles.grid}>
      <ScheduleFilterField
        values={classTypes}
        options={classTypeOptions}
        allLabel={scheduleCopy.filterClassTypeAll}
        applyLabel={scheduleCopy.filterApply}
        selectedCountLabel={scheduleCopy.filterSelectedCount}
        onChange={onClassTypesChange}
        accessibilityLabel={scheduleCopy.filterClassTypeAll}
      />
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
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 16,
  },
});
