import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  addMonths,
  buildMonthWeeks,
  isSameCalendarDay,
  startOfLocalDay,
  startOfLocalMonth,
} from "../../../lib/schedule/scheduleDateUtils";
import { formatScheduleMonthLabel } from "../../schedule/scheduleFormat";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";
import {
  coachScheduleWeekdayLabels,
  groupCoachSessionsByDay,
  localIsoDay,
} from "../lib/coachScheduleView";
import type { CoachPanelSessionRow, CoachSessionStatus } from "../types/coachPanel";
import { CoachScheduleSessionCard } from "./CoachScheduleSessionCard";

type CoachScheduleMonthViewProps = {
  locale: string;
  rows: readonly CoachPanelSessionRow[];
  emptyDay: string;
  prevMonthAria: string;
  nextMonthAria: string;
  statusLabel: (status: CoachSessionStatus) => string;
};

export function CoachScheduleMonthView({
  locale,
  rows,
  emptyDay,
  prevMonthAria,
  nextMonthAria,
  statusLabel,
}: CoachScheduleMonthViewProps) {
  const today = useMemo(() => startOfLocalDay(new Date()), []);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfLocalMonth(today));
  const [selectedDay, setSelectedDay] = useState(() => today);
  const grouped = useMemo(() => groupCoachSessionsByDay(rows), [rows]);
  const weeks = useMemo(() => buildMonthWeeks(visibleMonth), [visibleMonth]);
  const selectedRows = grouped.get(localIsoDay(selectedDay)) ?? [];
  const weekdayLabels = useMemo(() => coachScheduleWeekdayLabels(locale), [locale]);

  return (
    <View style={styles.wrap}>
      <View style={styles.nav}>
        <Pressable
          onPress={() => setVisibleMonth((current) => addMonths(current, -1))}
          accessibilityRole="button"
          accessibilityLabel={prevMonthAria}
          style={styles.navBtn}
        >
          <Text style={styles.navLabel}>‹</Text>
        </Pressable>
        <Text style={styles.month}>{formatScheduleMonthLabel(visibleMonth, locale)}</Text>
        <Pressable
          onPress={() => setVisibleMonth((current) => addMonths(current, 1))}
          accessibilityRole="button"
          accessibilityLabel={nextMonthAria}
          style={styles.navBtn}
        >
          <Text style={styles.navLabel}>›</Text>
        </Pressable>
      </View>
      <View style={styles.weekdays}>
        {weekdayLabels.map((label, index) => (
          <Text key={`${label}-${index}`} style={styles.weekday}>
            {label}
          </Text>
        ))}
      </View>
      {weeks.map((week) => (
        <View key={localIsoDay(week[0])} style={styles.week}>
          {week.map((day) => (
            <CoachScheduleMonthDayCell
              key={localIsoDay(day)}
              day={day}
              visibleMonth={visibleMonth}
              selectedDay={selectedDay}
              today={today}
              hasSessions={(grouped.get(localIsoDay(day))?.length ?? 0) > 0}
              onSelect={setSelectedDay}
            />
          ))}
        </View>
      ))}
      <View style={styles.dayList}>
        {selectedRows.length === 0 ? (
          <Text style={styles.empty}>{emptyDay}</Text>
        ) : (
          selectedRows.map((session) => (
            <CoachScheduleSessionCard
              key={session.id}
              session={session}
              locale={locale}
              statusLabel={statusLabel(session.status)}
            />
          ))
        )}
      </View>
    </View>
  );
}

function CoachScheduleMonthDayCell({
  day,
  visibleMonth,
  selectedDay,
  today,
  hasSessions,
  onSelect,
}: {
  day: Date;
  visibleMonth: Date;
  selectedDay: Date;
  today: Date;
  hasSessions: boolean;
  onSelect: (day: Date) => void;
}) {
  if (day.getMonth() !== visibleMonth.getMonth()) {
    return <View style={styles.slot} />;
  }
  const selected = isSameCalendarDay(day, selectedDay);
  const isToday = isSameCalendarDay(day, today);
  return (
    <Pressable
      onPress={() => onSelect(day)}
      style={[styles.slot, selected && styles.slotSelected, isToday && !selected && styles.slotToday]}
      accessibilityRole="button"
    >
      <Text style={[styles.dayText, selected && styles.dayTextSelected]}>{day.getDate()}</Text>
      {hasSessions ? <View style={[styles.dot, selected && styles.dotSelected]} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: space.sm,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  navLabel: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.sectionTitle,
    color: colors.primaryGreen,
  },
  month: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.body,
    color: colors.primaryGreen,
    textTransform: "capitalize",
  },
  weekdays: {
    flexDirection: "row",
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    color: colors.taupe,
  },
  week: {
    flexDirection: "row",
  },
  slot: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
  },
  slotSelected: {
    backgroundColor: colors.primaryGreen,
  },
  slotToday: {
    borderWidth: 1,
    borderColor: colors.primaryGreen,
  },
  dayText: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.ink,
  },
  dayTextSelected: {
    color: colors.white,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryGreen,
    marginTop: 2,
  },
  dotSelected: {
    backgroundColor: colors.white,
  },
  dayList: {
    gap: space.sm,
  },
  empty: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.bodyMuted,
    textAlign: "center",
    paddingVertical: space.lg,
  },
});
