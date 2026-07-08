import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { readStoredAccessToken } from "../../../auth/accessTokenStorage";
import {
  bookSession,
  fetchClassSessionsRange,
  joinWaitlistSession,
  type ClassSessionRow,
} from "../../../lib/api/memberClient";
import { MEMBER_SESSION_RANGE_DAYS } from "../../../lib/member/sessionRangeDays";
import { SCHEDULE_PAGE_MOBILE } from "../../../lib/schedule/schedulePageTokens";
import {
  addDays,
  isSameCalendarDay,
  startOfLocalDay,
} from "../../../lib/schedule/scheduleDateUtils";
import {
  buildScheduleInitialNav,
  shiftScheduleDateWindow,
  type ScheduleNavState,
} from "../../../lib/schedule/scheduleNav";
import { GradientBackdrop } from "../../../components/layout/GradientBackdrop";
import { ScheduleDateControls } from "../../schedule/components/ScheduleDateControls";
import { ScheduleEmptyState } from "../../schedule/components/ScheduleEmptyState";
import { ScheduleFiltersHeader } from "../../schedule/components/ScheduleFiltersHeader";
import type { ScheduleFilterOption } from "../../schedule/components/ScheduleFilterField";
import { ScheduleSessionRow } from "../../schedule/components/ScheduleSessionRow";
import { ScheduleViewShell } from "../../schedule/components/ScheduleViewShell";
import { scheduleCopy } from "../../schedule/scheduleCopy";
import { scheduleColors } from "../../schedule/scheduleTokens";
import { colors, layout, space } from "../../../theme/tokens";
import { fontFamilies } from "../../../theme/fontFamilies";

const LOCALE = "en-US";
const FILTER_ALL = "all";

function sessionRange(): { from: Date; to: Date } {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + MEMBER_SESSION_RANGE_DAYS);
  return { from, to };
}

function buildFilterOptions(
  values: readonly string[],
  allLabel: string,
): ScheduleFilterOption[] {
  return [
    { value: FILTER_ALL, label: allLabel },
    ...values.map((value) => ({ value, label: value })),
  ];
}

function isSessionFull(session: ClassSessionRow): boolean {
  return session.status === "FULL" || session._count.bookings >= session.capacity;
}

export function MemberScheduleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [sessions, setSessions] = useState<ClassSessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingSessionId, setBookingSessionId] = useState<string | null>(null);
  const [classType, setClassType] = useState(FILTER_ALL);
  const [instructor, setInstructor] = useState(FILTER_ALL);
  const [nav, setNav] = useState<ScheduleNavState>(() =>
    buildScheduleInitialNav(startOfLocalDay(new Date())),
  );

  const maxDate = useMemo(() => {
    const d = startOfLocalDay(new Date());
    return addDays(d, MEMBER_SESSION_RANGE_DAYS);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchClassSessionsRange(sessionRange());
      setSessions(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : scheduleCopy.loadError);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const classTypeOptions = useMemo(
    () =>
      buildFilterOptions(
        Array.from(new Set(sessions.map((s) => s.classType.name.trim()))).filter(
          (name) => name.length > 0,
        ),
        scheduleCopy.filterClassTypeAll,
      ),
    [sessions],
  );

  const instructorOptions = useMemo(
    () =>
      buildFilterOptions(
        Array.from(
          new Set(
            sessions
              .map((s) => s.coach.user.name?.trim() ?? "")
              .filter((name) => name.length > 0),
          ),
        ),
        scheduleCopy.filterInstructorAll,
      ),
    [sessions],
  );

  const visibleSessions = useMemo(() => {
    return sessions
      .filter((session) => isSameCalendarDay(new Date(session.startsAt), nav.selectedDate))
      .filter((session) => classType === FILTER_ALL || session.classType.name === classType)
      .filter((session) => {
        if (instructor === FILTER_ALL) {
          return true;
        }
        return (session.coach.user.name?.trim() ?? "") === instructor;
      })
      .sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      );
  }, [sessions, nav.selectedDate, classType, instructor]);

  const onBookPress = useCallback(
    async (session: ClassSessionRow) => {
      const token = await readStoredAccessToken();
      if (token === null) {
        router.push("/login");
        return;
      }

      setBookingSessionId(session.id);
      try {
        if (isSessionFull(session)) {
          await joinWaitlistSession(token, session.id);
          Alert.alert("Waitlist", "You are on the waitlist for this class.");
        } else {
          await bookSession(token, session.id);
          Alert.alert("Booked", "Your spot is reserved.");
        }
        await load();
      } catch (e) {
        Alert.alert(
          "Could not complete",
          e instanceof Error ? e.message : "Try again later.",
        );
      } finally {
        setBookingSessionId(null);
      }
    },
    [load, router],
  );

  const bottomPad =
    layout.tabBarHeight + Math.max(insets.bottom, space.sm) + space.xl;

  return (
    <View style={styles.root}>
      <GradientBackdrop />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>{scheduleCopy.pageTitle}</Text>

        <ScheduleViewShell>
          <ScheduleFiltersHeader
            classType={classType}
            instructor={instructor}
            classTypeOptions={classTypeOptions}
            instructorOptions={instructorOptions}
            onClassTypeChange={setClassType}
            onInstructorChange={setInstructor}
          />

          <ScheduleDateControls
            locale={LOCALE}
            selectedDate={nav.selectedDate}
            windowStart={nav.windowStart}
            maxDate={maxDate}
            onSelectDay={(date) =>
              setNav((current) => ({ ...current, selectedDate: date }))
            }
            onShiftWindow={(deltaDays) =>
              setNav((current) =>
                shiftScheduleDateWindow(current, deltaDays, startOfLocalDay(new Date())),
              )
            }
          />

          {loading ? (
            <Text style={styles.meta}>{scheduleCopy.loading}</Text>
          ) : error !== null ? (
            <Text style={styles.error}>{error}</Text>
          ) : visibleSessions.length === 0 ? (
            <ScheduleEmptyState />
          ) : (
            <View style={styles.sessionList}>
              {visibleSessions.map((session) => (
                <ScheduleSessionRow
                  key={session.id}
                  session={session}
                  locale={LOCALE}
                  onBookPress={onBookPress}
                  booking={bookingSessionId === session.id}
                />
              ))}
            </View>
          )}
        </ScheduleViewShell>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingTop: space.lg,
    paddingHorizontal: SCHEDULE_PAGE_MOBILE.pageHorizontalPaddingPx,
    gap: SCHEDULE_PAGE_MOBILE.pageTitleToShellGapPx,
  },
  pageTitle: {
    fontFamily: fontFamilies.gtSuperDs.boldItalic,
    fontSize: SCHEDULE_PAGE_MOBILE.pageTitleSizePx,
    lineHeight: SCHEDULE_PAGE_MOBILE.pageTitleLineHeightPx,
    letterSpacing: -0.88,
    color: scheduleColors.pageTitle,
  },
  sessionList: {
    gap: SCHEDULE_PAGE_MOBILE.sessionListGapPx,
  },
  meta: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: 14,
    color: scheduleColors.muted,
    textAlign: "center",
  },
  error: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: 14,
    color: colors.warmBrown,
    textAlign: "center",
  },
});
