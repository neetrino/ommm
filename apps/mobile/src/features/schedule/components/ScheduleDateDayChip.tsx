import { Pressable, StyleSheet, Text, View } from "react-native";
import { platformShadow } from "../../../theme/platformShadow";
import { fontFamilies } from "../../../theme/fontFamilies";
import { formatScheduleWeekdayShort } from "../scheduleFormat";
import { scheduleColors, scheduleLayout } from "../scheduleTokens";

export type ScheduleDateChipState = "past" | "today" | "selected" | "idle";

type ScheduleDateDayChipProps = {
  day: Date;
  locale: string;
  chipState: ScheduleDateChipState;
  onPress: () => void;
};

export function ScheduleDateDayChip({
  day,
  locale,
  chipState,
  onPress,
}: ScheduleDateDayChipProps) {
  const weekday = formatScheduleWeekdayShort(day, locale);
  const dayNum = String(day.getDate());
  const weekdayStyle = [
    styles.weekday,
    chipState === "selected" || chipState === "today"
      ? styles.weekdayActive
      : undefined,
  ];
  const chipStyle = [
    styles.chip,
    chipState === "past" && styles.chipPast,
    chipState === "idle" && styles.chipIdle,
    chipState === "today" && styles.chipToday,
    chipState === "selected" && styles.chipSelected,
  ];

  if (chipState === "past") {
    return (
      <View style={styles.dayCell}>
        <Text style={weekdayStyle}>{weekday}</Text>
        <View style={chipStyle}>
          <Text style={styles.chipTextPast}>{dayNum}</Text>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={styles.dayCell}
      accessibilityRole="button"
    >
      <Text style={weekdayStyle}>{weekday}</Text>
      <View style={chipStyle}>
        <Text
          style={[
            styles.chipText,
            (chipState === "today" || chipState === "selected") &&
              styles.chipTextOnOlive,
            chipState === "selected" && styles.chipTextSelected,
          ]}
        >
          {dayNum}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dayCell: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  weekday: {
    width: "100%",
    textAlign: "center",
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 9,
    letterSpacing: 1.26,
    color: scheduleColors.olive,
  },
  weekdayActive: {
    color: scheduleColors.oliveActive,
  },
  chip: {
    width: "100%",
    maxWidth: scheduleLayout.chipMaxSize,
    aspectRatio: 1,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  chipIdle: {
    borderColor: scheduleColors.chipIdleBorder,
    backgroundColor: scheduleColors.chipIdleBg,
  },
  chipToday: {
    borderColor: scheduleColors.olive,
    backgroundColor: scheduleColors.olive,
  },
  chipSelected: {
    borderColor: scheduleColors.olive,
    backgroundColor: "rgba(255, 255, 255, 0.82)",
    ...platformShadow({
      color: scheduleColors.olive,
      offsetHeight: 0,
      opacity: 0.22,
      radius: 0,
      elevation: 0,
    }),
  },
  chipPast: {
    borderColor: scheduleColors.chipPastBorder,
    backgroundColor: scheduleColors.chipPastBg,
    opacity: 0.45,
  },
  chipText: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 14,
    color: scheduleColors.olive,
  },
  chipTextOnOlive: {
    color: scheduleColors.canvasText,
  },
  chipTextSelected: {
    color: scheduleColors.oliveActive,
  },
  chipTextPast: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 14,
    color: scheduleColors.chipPastText,
  },
});
