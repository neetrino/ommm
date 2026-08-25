import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Fragment } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SCHEDULE_PAGE_MOBILE } from "../../../lib/schedule/schedulePageTokens";
import { platformShadow } from "../../../theme/platformShadow";
import {
  addDays,
  compareCalendarDays,
  isAfterCalendarDay,
  isBeforeCalendarDay,
  isSameCalendarDay,
  startOfLocalDay,
} from "../../../lib/schedule/scheduleDateUtils";
import {
  SCHEDULE_DATE_STRIP_VISIBLE_DAYS,
  SCHEDULE_DATE_STRIP_WINDOW_SHIFT,
} from "../../../lib/schedule/scheduleNav";
import { fontFamilies } from "../../../theme/fontFamilies";
import {
  formatScheduleMonthLabel,
  formatScheduleSelectedDayLabel,
  formatScheduleWeekdayShort,
} from "../scheduleFormat";
import { useScheduleCopy } from "../useScheduleCopy";
import { scheduleColors, scheduleLayout } from "../scheduleTokens";

/** Lift today’s date chip above the rest of the strip. */
const TODAY_CHIP_LIFT_PX = 8;

type ScheduleDateControlsProps = {
  locale: string;
  selectedDate: Date;
  windowStart: Date;
  maxDate: Date;
  onSelectDay: (date: Date) => void;
  onShiftWindow: (deltaDays: number) => void;
};

type DateChipState = "past" | "today" | "selected" | "idle";

function resolveChipState(day: Date, selectedDate: Date, today: Date, maxDate: Date): DateChipState {
  if (isBeforeCalendarDay(day, today) || isAfterCalendarDay(day, maxDate)) {
    return "past";
  }
  if (isSameCalendarDay(day, today)) {
    return "today";
  }
  if (isSameCalendarDay(day, selectedDate)) {
    return "selected";
  }
  return "idle";
}

export function ScheduleDateControls({
  locale,
  selectedDate,
  windowStart,
  maxDate,
  onSelectDay,
  onShiftWindow,
}: ScheduleDateControlsProps) {
  const scheduleCopy = useScheduleCopy();
  const stripDays = Array.from({ length: SCHEDULE_DATE_STRIP_VISIBLE_DAYS }, (_, idx) =>
    addDays(windowStart, idx),
  );
  const today = startOfLocalDay(new Date());
  const canShiftPrev = compareCalendarDays(addDays(windowStart, -1), today) >= 0;
  const canShiftNext = !isAfterCalendarDay(
    addDays(windowStart, SCHEDULE_DATE_STRIP_WINDOW_SHIFT),
    maxDate,
  );

  return (
    <Fragment>
      <View style={styles.monthWrap}>
        <Text style={styles.monthLabel}>{formatScheduleMonthLabel(selectedDate, locale)}</Text>
      </View>

      <View style={styles.stripWrap}>
        <View style={styles.stripPanel}>
          <View style={styles.stripRow}>
            <Pressable
              onPress={() => onShiftWindow(-SCHEDULE_DATE_STRIP_WINDOW_SHIFT)}
              disabled={!canShiftPrev}
              style={[styles.arrowBtn, !canShiftPrev && styles.arrowBtnDisabled]}
              accessibilityRole="button"
              accessibilityLabel={scheduleCopy.prevDatesAria}
            >
              <MaterialCommunityIcons name="chevron-left" size={22} color={scheduleColors.oliveActive} />
            </Pressable>

            <View style={styles.daysRow}>
              {stripDays.map((day) => {
                const chipState = resolveChipState(day, selectedDate, today, maxDate);
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
                  chipState === "today" && styles.chipTodayLift,
                ];

                if (chipState === "past") {
                  return (
                    <View key={day.getTime()} style={styles.dayCell}>
                      <Text style={weekdayStyle}>{weekday}</Text>
                      <View style={chipStyle}>
                        <Text style={styles.chipTextPast}>{dayNum}</Text>
                      </View>
                    </View>
                  );
                }

                return (
                  <Pressable
                    key={day.getTime()}
                    onPress={() => onSelectDay(startOfLocalDay(day))}
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
              })}
            </View>

            <Pressable
              onPress={() => onShiftWindow(SCHEDULE_DATE_STRIP_WINDOW_SHIFT)}
              disabled={!canShiftNext}
              style={[styles.arrowBtn, !canShiftNext && styles.arrowBtnDisabled]}
              accessibilityRole="button"
              accessibilityLabel={scheduleCopy.nextDatesAria}
            >
              <MaterialCommunityIcons name="chevron-right" size={22} color={scheduleColors.oliveActive} />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.divider}>
        <Text style={styles.selectedDay}>
          {formatScheduleSelectedDayLabel(selectedDate, locale)}
        </Text>
      </View>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  monthWrap: {
    marginTop: SCHEDULE_PAGE_MOBILE.monthMarginTopPx,
  },
  monthLabel: {
    fontFamily: fontFamilies.gtSuperDs.boldItalic,
    fontSize: 22,
    lineHeight: 24,
    letterSpacing: -0.44,
    color: scheduleColors.pageTitle,
    textTransform: "capitalize",
  },
  stripWrap: {
    marginTop: SCHEDULE_PAGE_MOBILE.stripMarginTopPx,
  },
  stripPanel: {
    borderRadius: scheduleLayout.stripRadius,
    borderWidth: 1,
    borderColor: scheduleColors.stripBorder,
    backgroundColor: scheduleColors.stripBg,
    paddingHorizontal: 8,
    paddingTop: 14 + TODAY_CHIP_LIFT_PX,
    paddingBottom: 14,
    overflow: "visible",
  },
  stripRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    overflow: "visible",
  },
  arrowBtn: {
    width: scheduleLayout.arrowSize,
    height: scheduleLayout.arrowSize,
    borderRadius: scheduleLayout.arrowSize / 2,
    borderWidth: 1,
    borderColor: scheduleColors.filterBorder,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    alignItems: "center",
    justifyContent: "center",
    ...platformShadow({
      color: "#2d2823",
      offsetHeight: 8,
      opacity: 0.14,
      radius: 14,
      elevation: 2,
    }),
  },
  arrowBtnDisabled: {
    opacity: 0.38,
  },
  daysRow: {
    flex: 1,
    flexDirection: "row",
    minWidth: 0,
    gap: 2,
    overflow: "visible",
  },
  dayCell: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
    overflow: "visible",
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
  chipTodayLift: {
    transform: [{ translateY: -TODAY_CHIP_LIFT_PX }],
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
  divider: {
    marginTop: SCHEDULE_PAGE_MOBILE.dividerMarginTopPx,
    paddingBottom: SCHEDULE_PAGE_MOBILE.dividerPaddingBottomPx,
    borderBottomWidth: 1,
    borderBottomColor: scheduleColors.divider,
  },
  selectedDay: {
    fontFamily: fontFamilies.gtSuperDs.boldItalic,
    fontSize: 18,
    lineHeight: 21,
    letterSpacing: -0.27,
    color: scheduleColors.pageTitle,
    textTransform: "capitalize",
  },
});
