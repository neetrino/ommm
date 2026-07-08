import { StyleSheet, View } from "react-native";
import { scheduleCopy } from "../scheduleCopy";
import {
  ScheduleFilterField,
  type ScheduleFilterOption,
} from "./ScheduleFilterField";

type ScheduleFiltersHeaderProps = {
  classType: string;
  instructor: string;
  classTypeOptions: readonly ScheduleFilterOption[];
  instructorOptions: readonly ScheduleFilterOption[];
  onClassTypeChange: (value: string) => void;
  onInstructorChange: (value: string) => void;
};

export function ScheduleFiltersHeader({
  classType,
  instructor,
  classTypeOptions,
  instructorOptions,
  onClassTypeChange,
  onInstructorChange,
}: ScheduleFiltersHeaderProps) {
  return (
    <View style={styles.grid}>
      <ScheduleFilterField
        value={classType}
        options={classTypeOptions}
        onChange={onClassTypeChange}
        accessibilityLabel={scheduleCopy.filterClassTypeAll}
      />
      <ScheduleFilterField
        value={instructor}
        options={instructorOptions}
        onChange={onInstructorChange}
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
