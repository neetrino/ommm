import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatScheduleMonthLabel } from "../../schedule/scheduleFormat";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, typography } from "../../../theme/tokens";
import {
  addSalaryMonths,
  currentStudioSalaryMonth,
  dateFromSalaryMonth,
} from "../lib/coachSalaryMonth";

type CoachSalaryMonthNavProps = {
  locale: string;
  month: string;
  ariaLabel: string;
  prevMonthAria: string;
  nextMonthAria: string;
  onChange: (month: string) => void;
};

export function CoachSalaryMonthNav({
  locale,
  month,
  ariaLabel,
  prevMonthAria,
  nextMonthAria,
  onChange,
}: CoachSalaryMonthNavProps) {
  const currentMonth = currentStudioSalaryMonth();
  const canShiftNext = month < currentMonth;
  const labelDate = dateFromSalaryMonth(month);

  return (
    <View style={styles.row} accessibilityRole="adjustable" accessibilityLabel={ariaLabel}>
      <Pressable
        onPress={() => onChange(addSalaryMonths(month, -1))}
        accessibilityRole="button"
        accessibilityLabel={prevMonthAria}
        style={styles.navBtn}
      >
        <Text style={styles.navLabel}>‹</Text>
      </Pressable>
      <Text style={styles.month}>
        {formatScheduleMonthLabel(labelDate, locale)} {labelDate.getFullYear()}
      </Text>
      <Pressable
        onPress={() => {
          if (canShiftNext) {
            onChange(addSalaryMonths(month, 1));
          }
        }}
        disabled={!canShiftNext}
        accessibilityRole="button"
        accessibilityLabel={nextMonthAria}
        style={styles.navBtn}
      >
        <Text style={[styles.navLabel, !canShiftNext && styles.navLabelDisabled]}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
  },
  navLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.sectionTitle,
    color: colors.primaryGreen,
  },
  navLabelDisabled: {
    color: colors.taupe,
  },
  month: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.body,
    color: colors.primaryGreen,
    textTransform: "capitalize",
  },
});
