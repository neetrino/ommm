import { useEffect, useMemo, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { isSameCalendarDay, startOfLocalDay } from "../../../lib/schedule/scheduleDateUtils";
import { formatScheduleWeekdayShort } from "../../schedule/scheduleFormat";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";
import {
  buildCoachScheduleWeekDays,
  groupCoachSessionsByDay,
  localIsoDay,
} from "../lib/coachScheduleView";
import type { CoachPanelSessionRow, CoachSessionStatus } from "../types/coachPanel";
import { CoachScheduleSessionCard } from "./CoachScheduleSessionCard";

const WEEK_COLUMN_WIDTH = 196;

type CoachScheduleWeekViewProps = {
  locale: string;
  rows: readonly CoachPanelSessionRow[];
  emptyDay: string;
  todayBadge: string;
  statusLabel: (status: CoachSessionStatus) => string;
};

export function CoachScheduleWeekView({
  locale,
  rows,
  emptyDay,
  todayBadge,
  statusLabel,
}: CoachScheduleWeekViewProps) {
  const today = useMemo(() => startOfLocalDay(new Date()), []);
  const days = useMemo(() => buildCoachScheduleWeekDays(today), [today]);
  const grouped = useMemo(() => groupCoachSessionsByDay(rows), [rows]);
  const scrollRef = useRef<ScrollView>(null);
  const todayIndex = days.findIndex((day) => isSameCalendarDay(day, today));

  useEffect(() => {
    if (todayIndex < 0) {
      return;
    }
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        x: Math.max(todayIndex, 0) * WEEK_COLUMN_WIDTH,
        animated: false,
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [todayIndex]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.track}
    >
      {days.map((day) => (
        <CoachScheduleWeekColumn
          key={localIsoDay(day)}
          day={day}
          today={today}
          locale={locale}
          rows={grouped.get(localIsoDay(day)) ?? []}
          emptyDay={emptyDay}
          todayBadge={todayBadge}
          statusLabel={statusLabel}
        />
      ))}
    </ScrollView>
  );
}

function CoachScheduleWeekColumn({
  day,
  today,
  locale,
  rows,
  emptyDay,
  todayBadge,
  statusLabel,
}: {
  day: Date;
  today: Date;
  locale: string;
  rows: readonly CoachPanelSessionRow[];
  emptyDay: string;
  todayBadge: string;
  statusLabel: (status: CoachSessionStatus) => string;
}) {
  const isToday = isSameCalendarDay(day, today);
  return (
    <View style={[styles.column, day < today && styles.columnPast]}>
      <Text style={styles.weekday}>{formatScheduleWeekdayShort(day, locale)}</Text>
      <Text style={styles.date}>{day.getDate()}</Text>
      {isToday ? <Text style={styles.today}>{todayBadge}</Text> : null}
      {rows.length === 0 ? (
        <Text style={styles.empty}>{emptyDay}</Text>
      ) : (
        rows.map((session) => (
          <CoachScheduleSessionCard
            key={session.id}
            session={session}
            locale={locale}
            statusLabel={statusLabel(session.status)}
            compact
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    gap: space.sm,
    paddingBottom: space.sm,
  },
  column: {
    width: WEEK_COLUMN_WIDTH,
    borderRadius: radii.labelCard,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: space.sm,
    gap: space.xs,
  },
  columnPast: {
    backgroundColor: colors.badgeCream,
  },
  weekday: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    color: colors.taupe,
  },
  date: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.body,
    color: colors.primaryGreen,
  },
  today: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.caption,
    color: colors.primaryGreen,
  },
  empty: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.bodyMuted,
  },
});
