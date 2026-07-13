import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSession } from "../../../auth/SessionProvider";
import { useLocale, useTranslations } from "../../../i18n/I18nProvider";
import { formatAmdFromCents } from "../../../lib/formatAmd";
import { coachPath } from "../../../navigation/memberPaths";
import { UserGreetingSection } from "../../home/components/UserGreetingSection";
import {
  CoachMetricCard,
  CoachShortcutCard,
  CoachStateCard,
} from "../components/CoachMetricCards";
import { CoachScreenShell } from "../components/CoachScreenShell";
import { useCoachPanelData } from "../hooks/useCoachPanelData";
import {
  formatCoachSessionDate,
  formatCoachSessionTime,
  isSameLocalCalendarDay,
} from "../lib/coachFilters";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";

const UPCOMING_PREVIEW_LIMIT = 3;

export function CoachHomeScreen() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("coachPages.home");
  const { userGreetingName, homeImageUri, profileInitials } = useSession();
  const { state, reload } = useCoachPanelData({
    includeRoster: true,
    includeSalary: true,
  });

  if (state.status === "loading") {
    return <CoachScreenShell loading />;
  }

  if (state.status === "no_profile") {
    return (
      <CoachScreenShell>
        <UserGreetingSection
          displayName={userGreetingName}
          avatarImageUri={homeImageUri}
          avatarInitials={profileInitials}
        />
        <CoachStateCard message={t("noProfile")} />
      </CoachScreenShell>
    );
  }

  if (state.status === "error") {
    return (
      <CoachScreenShell>
        <UserGreetingSection
          displayName={userGreetingName}
          avatarImageUri={homeImageUri}
          avatarInitials={profileInitials}
        />
        <CoachStateCard
          message={state.message || t("loadFailed")}
          actionLabel={t("retry")}
          onAction={reload}
        />
      </CoachScreenShell>
    );
  }

  const today = new Date();
  const todaysSessions = state.sessions.filter((s) =>
    isSameLocalCalendarDay(s.startsAt, today),
  );
  const todaysRoster = state.roster.filter((b) =>
    isSameLocalCalendarDay(b.session.startsAt, today),
  );
  const upcoming = [...state.sessions]
    .filter((s) => new Date(s.startsAt).getTime() >= Date.now())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, UPCOMING_PREVIEW_LIMIT);

  return (
    <CoachScreenShell>
      <UserGreetingSection
        displayName={userGreetingName}
        avatarImageUri={homeImageUri}
        avatarInitials={profileInitials}
      />

      <Text style={styles.sectionTitle}>{t("todayAtGlance")}</Text>
      <View style={styles.metricsRow}>
        <CoachMetricCard
          label={t("classesToday")}
          value={String(todaysSessions.length)}
        />
        <CoachMetricCard
          label={t("bookedClientsToday")}
          value={String(todaysRoster.length)}
        />
        <CoachMetricCard
          label={t("upcomingSessionsRange")}
          value={String(state.sessions.length)}
        />
      </View>

      <Text style={styles.sectionTitle}>{t("upcomingHeading")}</Text>
      {upcoming.length === 0 ? (
        <CoachStateCard message={t("emptyUpcoming")} />
      ) : (
        <View style={styles.list}>
          {upcoming.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <Text style={styles.sessionTitle}>{session.title}</Text>
              <Text style={styles.sessionMeta}>
                {formatCoachSessionDate(session.startsAt, locale)} ·{" "}
                {formatCoachSessionTime(session.startsAt, locale)}–
                {formatCoachSessionTime(session.endsAt, locale)}
              </Text>
              <Text style={styles.sessionMeta}>
                {session.classType.name} · {session.status} ·{" "}
                {t("bookedCount", { count: session._count.bookings })}
              </Text>
            </View>
          ))}
        </View>
      )}

      <CoachShortcutCard
        title={t("openSchedule")}
        actionLabel={t("openSchedule")}
        onPress={() => router.push(coachPath("schedule"))}
      />
      <CoachShortcutCard
        title={t("viewParticipantsAttendance")}
        actionLabel={t("viewParticipantsAttendance")}
        onPress={() => router.push(coachPath("groups"))}
      />
      {state.salary ? (
        <CoachShortcutCard
          title={t("openSalary")}
          subtitle={t("salaryPending", {
            amount: formatAmdFromCents(state.salary.pendingPayoutCents),
          })}
          actionLabel={t("openSalary")}
          onPress={() => router.push(coachPath("salary"))}
        />
      ) : (
        <CoachShortcutCard
          title={t("openSalary")}
          actionLabel={t("openSalary")}
          onPress={() => router.push(coachPath("salary"))}
        />
      )}
      <CoachShortcutCard
        title={t("openAnalytics")}
        actionLabel={t("openAnalytics")}
        onPress={() => router.push(coachPath("analytics"))}
      />
    </CoachScreenShell>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.body,
    color: colors.primaryGreen,
    marginTop: space.xs,
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
  },
  list: {
    gap: space.sm,
  },
  sessionCard: {
    borderRadius: radii.labelCard,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: space.md,
    gap: space.xxs,
  },
  sessionTitle: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.body,
    color: colors.primaryGreen,
  },
  sessionMeta: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.bodyMuted,
    lineHeight: 20,
  },
});
