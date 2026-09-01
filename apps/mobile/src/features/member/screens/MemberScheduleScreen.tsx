import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
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
  type ScheduleNavState,
} from "../../../lib/schedule/scheduleNav";
import { GradientBackdrop } from "../../../components/layout/GradientBackdrop";
import { AppHeader } from "../../../components/layout/AppHeader";
import { useAppHeaderBookPress } from "../../../components/layout/useAppHeaderBookPress";
import { useScreenChromeInsets } from "../../../components/layout/useScreenChrome";
import { ScheduleDateControls } from "../../schedule/components/ScheduleDateControls";
import { ScheduleDayContent } from "../../schedule/components/ScheduleDayContent";
import { ScheduleFiltersHeader } from "../../schedule/components/ScheduleFiltersHeader";
import type { ScheduleFilterOption } from "../../schedule/components/ScheduleFilterField";
import { useScheduleDayTransition } from "../../schedule/hooks/useScheduleDayTransition";
import { ScheduleViewShell } from "../../schedule/components/ScheduleViewShell";
import { useScheduleCopy } from "../../schedule/useScheduleCopy";
import { scheduleColors } from "../../schedule/scheduleTokens";
import { useMemberBookingCopy } from "../hooks/useMemberBookingCopy";
import { colors } from "../../../theme/tokens";
import { fontFamilies } from "../../../theme/fontFamilies";

function sessionRange(): { from: Date; to: Date } {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + MEMBER_SESSION_RANGE_DAYS);
  return { from, to };
}

function buildFilterOptions(values: readonly string[]): ScheduleFilterOption[] {
  return values.map((value) => ({ value, label: value }));
}

function matchesSelectedFilter(
  selected: readonly string[],
  value: string,
): boolean {
  return selected.length === 0 || selected.includes(value);
}

function isSessionFull(session: ClassSessionRow): boolean {
  return session.status === "FULL" || session._count.bookings >= session.capacity;
}

export function MemberScheduleScreen() {
  const router = useRouter();
  const scheduleCopy = useScheduleCopy();
  const bookingCopy = useMemberBookingCopy();
  const { paddingTop, paddingBottom, safePaddingLeft, safePaddingRight } =
    useScreenChromeInsets({ includeScreenGutter: false });
  const onHeaderBookPress = useAppHeaderBookPress();
  const [sessions, setSessions] = useState<ClassSessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingSessionId, setBookingSessionId] = useState<string | null>(null);
  const [classTypes, setClassTypes] = useState<string[]>([]);
  const [instructors, setInstructors] = useState<string[]>([]);
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
  }, [scheduleCopy.loadError]);

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
      ),
    [sessions],
  );

  const visibleSessions = useMemo(() => {
    return sessions
      .filter((session) => isSameCalendarDay(new Date(session.startsAt), nav.selectedDate))
      .filter((session) =>
        matchesSelectedFilter(classTypes, session.classType.name.trim()),
      )
      .filter((session) =>
        matchesSelectedFilter(
          instructors,
          session.coach.user.name?.trim() ?? "",
        ),
      )
      .sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      );
  }, [sessions, nav.selectedDate, classTypes, instructors]);

  const selectedDayKey = nav.selectedDate.toISOString().slice(0, 10);
  const {
    renderedSessions,
    animationPhase,
    containerStyle,
    getItemDelayMs,
  } = useScheduleDayTransition({
    selectedDayKey,
    visibleSessions,
  });

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
          Alert.alert(
            bookingCopy.waitlistSuccessTitle,
            bookingCopy.waitlistSuccessBody,
          );
        } else {
          await bookSession(token, session.id);
          Alert.alert(
            bookingCopy.bookSuccessTitle,
            bookingCopy.bookSuccessBody,
          );
        }
        await load();
      } catch (e) {
        Alert.alert(
          bookingCopy.actionFailedTitle,
          e instanceof Error ? e.message : bookingCopy.actionFailedFallback,
        );
      } finally {
        setBookingSessionId(null);
      }
    },
    [bookingCopy, load, router],
  );

  return (
    <View style={styles.root}>
      <GradientBackdrop />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop,
            paddingBottom,
            paddingLeft:
              SCHEDULE_PAGE_MOBILE.pageHorizontalPaddingPx + safePaddingLeft,
            paddingRight:
              SCHEDULE_PAGE_MOBILE.pageHorizontalPaddingPx + safePaddingRight,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>{scheduleCopy.pageTitle}</Text>

        <ScheduleViewShell>
          <ScheduleFiltersHeader
            classTypes={classTypes}
            instructors={instructors}
            classTypeOptions={classTypeOptions}
            instructorOptions={instructorOptions}
            onClassTypesChange={setClassTypes}
            onInstructorsChange={setInstructors}
          />

          <ScheduleDateControls
            locale={scheduleCopy.intlLocale}
            selectedDate={nav.selectedDate}
            maxDate={maxDate}
            onSelectDay={(date) =>
              setNav((current) => ({ ...current, selectedDate: date }))
            }
          />

          {loading ? (
            <Text style={styles.meta}>{scheduleCopy.loading}</Text>
          ) : error !== null ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <ScheduleDayContent
              locale={scheduleCopy.intlLocale}
              animationPhase={animationPhase}
              containerStyle={containerStyle}
              renderedSessions={renderedSessions}
              getItemDelayMs={getItemDelayMs}
              onBookPress={onBookPress}
              bookingSessionId={bookingSessionId}
            />
          )}
        </ScheduleViewShell>
      </ScrollView>
      <AppHeader onBookPress={onHeaderBookPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    gap: SCHEDULE_PAGE_MOBILE.pageTitleToShellGapPx,
  },
  pageTitle: {
    fontFamily: fontFamilies.gtSuperDs.boldItalic,
    fontSize: SCHEDULE_PAGE_MOBILE.pageTitleSizePx,
    lineHeight: SCHEDULE_PAGE_MOBILE.pageTitleLineHeightPx,
    letterSpacing: -0.88,
    color: scheduleColors.pageTitle,
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
