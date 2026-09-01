import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useBottomSheetSlideMotion } from "../../../hooks/useBottomSheetSlideMotion";
import {
  addMonths,
  buildMonthWeeks,
  isAfterCalendarDay,
  isBeforeCalendarDay,
  startOfLocalDay,
  startOfLocalMonth,
} from "../../../lib/schedule/scheduleDateUtils";
import { fontFamilies } from "../../../theme/fontFamilies";
import {
  formatScheduleMonthLabel,
  formatScheduleWeekdayShort,
} from "../scheduleFormat";
import { scheduleColors } from "../scheduleTokens";
import { ScheduleCalendarDayCell } from "./ScheduleCalendarDayCell";

const WEEKDAY_SAMPLE_SUNDAY = new Date(2024, 0, 7);
const NAV_ICON_SIZE = 22;

type ScheduleMonthCalendarSheetProps = {
  open: boolean;
  locale: string;
  selectedDate: Date;
  minDate: Date;
  maxDate: Date;
  title: string;
  prevMonthAria: string;
  nextMonthAria: string;
  onClose: () => void;
  onSelectDay: (date: Date) => void;
};

/**
 * Month grid bottom sheet for jumping to any bookable day in the session range.
 */
export function ScheduleMonthCalendarSheet({
  open,
  locale,
  selectedDate,
  minDate,
  maxDate,
  title,
  prevMonthAria,
  nextMonthAria,
  onClose,
  onSelectDay,
}: ScheduleMonthCalendarSheetProps) {
  const [presented, setPresented] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfLocalMonth(selectedDate),
  );
  const { backdropOpacity, sheetTranslateY, animateClose } =
    useBottomSheetSlideMotion(presented);

  useEffect(() => {
    if (!open) {
      return;
    }
    setVisibleMonth(startOfLocalMonth(selectedDate));
    setPresented(true);
  }, [open, selectedDate]);

  const minMonth = useMemo(() => startOfLocalMonth(minDate), [minDate]);
  const maxMonth = useMemo(() => startOfLocalMonth(maxDate), [maxDate]);
  const canPrev = isBeforeCalendarDay(minMonth, visibleMonth);
  const canNext = isAfterCalendarDay(maxMonth, visibleMonth);
  const weeks = useMemo(() => buildMonthWeeks(visibleMonth), [visibleMonth]);
  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, idx) => {
        const day = new Date(WEEKDAY_SAMPLE_SUNDAY);
        day.setDate(WEEKDAY_SAMPLE_SUNDAY.getDate() + idx);
        return formatScheduleWeekdayShort(day, locale).slice(0, 2);
      }),
    [locale],
  );
  const monthTitle = `${formatScheduleMonthLabel(visibleMonth, locale)} ${visibleMonth.getFullYear()}`;

  function closeSheet() {
    animateClose(() => {
      setPresented(false);
      onClose();
    });
  }

  function selectDay(day: Date) {
    const next = startOfLocalDay(day);
    animateClose(() => {
      setPresented(false);
      onClose();
      onSelectDay(next);
    });
  }

  if (!open && !presented) {
    return null;
  }

  return (
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
            { transform: [{ translateY: sheetTranslateY }] },
          ]}
        >
          <Text style={styles.sheetTitle}>{title}</Text>
          <View style={styles.monthNav}>
            <Pressable
              onPress={() => setVisibleMonth((m) => addMonths(m, -1))}
              disabled={!canPrev}
              style={({ pressed }) => [
                styles.navBtn,
                !canPrev && styles.navBtnDisabled,
                pressed && canPrev && styles.navBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={prevMonthAria}
              accessibilityState={{ disabled: !canPrev }}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={NAV_ICON_SIZE}
                color={
                  canPrev
                    ? scheduleColors.oliveActive
                    : scheduleColors.chipPastText
                }
              />
            </Pressable>
            <Text style={styles.monthLabel}>{monthTitle}</Text>
            <Pressable
              onPress={() => setVisibleMonth((m) => addMonths(m, 1))}
              disabled={!canNext}
              style={({ pressed }) => [
                styles.navBtn,
                !canNext && styles.navBtnDisabled,
                pressed && canNext && styles.navBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={nextMonthAria}
              accessibilityState={{ disabled: !canNext }}
            >
              <MaterialCommunityIcons
                name="chevron-right"
                size={NAV_ICON_SIZE}
                color={
                  canNext
                    ? scheduleColors.oliveActive
                    : scheduleColors.chipPastText
                }
              />
            </Pressable>
          </View>
          <View style={styles.weekdayRow}>
            {weekdayLabels.map((label, idx) => (
              <Text key={`wd-${idx}`} style={styles.weekdayLabel}>
                {label}
              </Text>
            ))}
          </View>
          <View style={styles.grid}>
            {weeks.map((week) => (
              <View
                key={week[0]?.getTime() ?? "week"}
                style={styles.weekRow}
              >
                {week.map((day) => (
                  <ScheduleCalendarDayCell
                    key={day.getTime()}
                    day={day}
                    visibleMonth={visibleMonth}
                    selectedDate={selectedDate}
                    minDate={minDate}
                    maxDate={maxDate}
                    onSelect={selectDay}
                  />
                ))}
              </View>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdropRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  sheet: {
    zIndex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 16,
  },
  sheetTitle: {
    fontFamily: fontFamilies.gtSuperDs.mediumItalic,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.44,
    color: scheduleColors.heading,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: scheduleColors.filterBorder,
    backgroundColor: scheduleColors.filterBg,
  },
  navBtnPressed: {
    opacity: 0.88,
  },
  navBtnDisabled: {
    opacity: 0.45,
  },
  monthLabel: {
    flex: 1,
    textAlign: "center",
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 16,
    letterSpacing: 0.2,
    color: scheduleColors.body,
    textTransform: "capitalize",
  },
  weekdayRow: {
    flexDirection: "row",
  },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    color: scheduleColors.olive,
  },
  grid: {
    gap: 6,
  },
  weekRow: {
    flexDirection: "row",
    width: "100%",
  },
});
