import { useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SCHEDULE_PAGE_MOBILE } from "../../../lib/schedule/schedulePageTokens";
import {
  addDays,
  compareCalendarDays,
  isAfterCalendarDay,
  isBeforeCalendarDay,
  isSameCalendarDay,
  startOfLocalDay,
  startOfWeekSunday,
} from "../../../lib/schedule/scheduleDateUtils";
import { SCHEDULE_DATE_STRIP_VISIBLE_DAYS } from "../../../lib/schedule/scheduleNav";
import { fontFamilies } from "../../../theme/fontFamilies";
import {
  formatScheduleMonthLabel,
  formatScheduleSelectedDayLabel,
} from "../scheduleFormat";
import { scheduleColors, scheduleLayout } from "../scheduleTokens";
import {
  ScheduleDateDayChip,
  type ScheduleDateChipState,
} from "./ScheduleDateDayChip";

const STRIP_SIDE_INSET = 8;
const STRIP_VERTICAL_PAD = 14;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

type ScheduleDateControlsProps = {
  locale: string;
  selectedDate: Date;
  maxDate: Date;
  onSelectDay: (date: Date) => void;
};

function resolveChipState(
  day: Date,
  selectedDate: Date,
  today: Date,
  maxDate: Date,
): ScheduleDateChipState {
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

/** Full Sunday–Saturday weeks from the week of `today` through the week of `maxDate`. */
function buildStripWeeks(today: Date, maxDate: Date): Date[][] {
  const start = startOfWeekSunday(today);
  const lastWeekStart = startOfWeekSunday(maxDate);
  const end = addDays(lastWeekStart, SCHEDULE_DATE_STRIP_VISIBLE_DAYS - 1);
  const totalDays =
    Math.floor(compareCalendarDays(end, start) / MS_PER_DAY) + 1;
  const days = Array.from({ length: Math.max(totalDays, 1) }, (_, idx) =>
    addDays(start, idx),
  );
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += SCHEDULE_DATE_STRIP_VISIBLE_DAYS) {
    weeks.push(days.slice(i, i + SCHEDULE_DATE_STRIP_VISIBLE_DAYS));
  }
  return weeks;
}

function weekIndexForDate(weeks: Date[][], date: Date): number {
  return Math.max(
    0,
    weeks.findIndex((week) =>
      week.some((day) => isSameCalendarDay(day, date)),
    ),
  );
}

export function ScheduleDateControls({
  locale,
  selectedDate,
  maxDate,
  onSelectDay,
}: ScheduleDateControlsProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const today = useMemo(() => startOfLocalDay(new Date()), []);
  const weeks = useMemo(
    () => buildStripWeeks(today, maxDate),
    [today, maxDate],
  );

  useEffect(() => {
    if (pageWidth <= 0) {
      return;
    }
    const index = weekIndexForDate(weeks, selectedDate);
    scrollRef.current?.scrollTo({
      x: index * pageWidth,
      animated: true,
    });
  }, [selectedDate, weeks, pageWidth]);

  const onStripLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && width !== pageWidth) {
      setPageWidth(width);
    }
  };

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (pageWidth <= 0) {
      return;
    }
    const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    const week = weeks[index];
    if (!week) {
      return;
    }
    const alreadyInWeek = week.some((day) =>
      isSameCalendarDay(day, selectedDate),
    );
    if (alreadyInWeek) {
      return;
    }
    const firstBookable =
      week.find(
        (day) =>
          !isBeforeCalendarDay(day, today) && !isAfterCalendarDay(day, maxDate),
      ) ?? week[0];
    if (firstBookable) {
      onSelectDay(startOfLocalDay(firstBookable));
    }
  };

  return (
    <View>
      <View style={styles.monthWrap}>
        <Text style={styles.monthLabel}>
          {formatScheduleMonthLabel(selectedDate, locale)}
        </Text>
      </View>

      <View style={styles.stripWrap}>
        <View style={styles.stripPanel}>
          <View onLayout={onStripLayout} style={styles.stripViewport}>
            {pageWidth > 0 ? (
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled
                onMomentumScrollEnd={onMomentumScrollEnd}
              >
                {weeks.map((week) => (
                  <View
                    key={week[0]?.getTime() ?? "week"}
                    style={[styles.weekPage, { width: pageWidth }]}
                  >
                    {week.map((day) => (
                      <ScheduleDateDayChip
                        key={day.getTime()}
                        day={day}
                        locale={locale}
                        chipState={resolveChipState(
                          day,
                          selectedDate,
                          today,
                          maxDate,
                        )}
                        onPress={() => onSelectDay(startOfLocalDay(day))}
                      />
                    ))}
                  </View>
                ))}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.divider}>
        <Text style={styles.selectedDay}>
          {formatScheduleSelectedDayLabel(selectedDate, locale)}
        </Text>
      </View>
    </View>
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
    paddingHorizontal: STRIP_SIDE_INSET,
    paddingTop: STRIP_VERTICAL_PAD,
    paddingBottom: STRIP_VERTICAL_PAD,
    overflow: "hidden",
  },
  stripViewport: {
    width: "100%",
  },
  weekPage: {
    flexDirection: "row",
    alignItems: "center",
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
