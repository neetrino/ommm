import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  isAfterCalendarDay,
  isBeforeCalendarDay,
  isSameCalendarDay,
  isSameCalendarMonth,
} from "../../../lib/schedule/scheduleDateUtils";
import { fontFamilies } from "../../../theme/fontFamilies";
import { scheduleColors } from "../scheduleTokens";

const DAY_HIT_SIZE = 40;

type CalendarDayCellProps = {
  day: Date;
  visibleMonth: Date;
  selectedDate: Date;
  minDate: Date;
  maxDate: Date;
  onSelect: (day: Date) => void;
};

function isDaySelectable(day: Date, minDate: Date, maxDate: Date): boolean {
  return (
    !isBeforeCalendarDay(day, minDate) && !isAfterCalendarDay(day, maxDate)
  );
}

export function ScheduleCalendarDayCell({
  day,
  visibleMonth,
  selectedDate,
  minDate,
  maxDate,
  onSelect,
}: CalendarDayCellProps) {
  const inMonth = isSameCalendarMonth(day, visibleMonth);
  if (!inMonth) {
    return <View style={styles.slot} />;
  }

  const selectable = isDaySelectable(day, minDate, maxDate);
  const selected = isSameCalendarDay(day, selectedDate);
  const isToday = isSameCalendarDay(day, minDate);

  return (
    <View style={styles.slot}>
      <Pressable
        onPress={() => onSelect(day)}
        disabled={!selectable}
        style={({ pressed }) => [
          styles.hit,
          selected && styles.hitSelected,
          isToday && !selected && styles.hitToday,
          pressed && selectable && styles.hitPressed,
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled: !selectable, selected }}
      >
        <Text
          style={[
            styles.text,
            !selectable && styles.textMuted,
            selected && styles.textSelected,
            isToday && !selected && styles.textToday,
          ]}
        >
          {day.getDate()}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hit: {
    width: DAY_HIT_SIZE,
    height: DAY_HIT_SIZE,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
  hitSelected: {
    backgroundColor: scheduleColors.olive,
  },
  hitToday: {
    borderWidth: 1.5,
    borderColor: scheduleColors.olive,
  },
  hitPressed: {
    opacity: 0.85,
  },
  text: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 14,
    color: scheduleColors.body,
  },
  textMuted: {
    color: scheduleColors.chipPastText,
  },
  textSelected: {
    color: scheduleColors.canvasText,
  },
  textToday: {
    color: scheduleColors.oliveActive,
  },
});
