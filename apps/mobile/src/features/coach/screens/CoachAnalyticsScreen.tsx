import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLocale, useTranslations } from "../../../i18n/I18nProvider";
import {
  fetchCoachAccountMe,
  fetchCoachAnalytics,
} from "../../../lib/api/coachClient";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, radii, space, typography } from "../../../theme/tokens";
import { CoachMetricCard, CoachStateCard } from "../components/CoachMetricCards";
import { CoachScreenShell } from "../components/CoachScreenShell";
import {
  COACH_ANALYTICS_PERIOD_DAYS,
  type CoachAnalyticsPeriod,
} from "../lib/constants";
import { formatPeakHourLabel } from "../lib/coachFilters";
import type { CoachAnalyticsPayload } from "../types/coachPanel";

type LoadState =
  | { status: "loading" }
  | { status: "no_profile" }
  | { status: "error"; message: string }
  | { status: "ready"; data: CoachAnalyticsPayload };

export function CoachAnalyticsScreen() {
  const locale = useLocale();
  const t = useTranslations("coachPages.analytics");
  const [period, setPeriod] = useState<CoachAnalyticsPeriod>("month");
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    void (async () => {
      try {
        const account = await fetchCoachAccountMe();
        if (account.coachProfileId === null || account.coachProfileId.length === 0) {
          if (!cancelled) {
            setState({ status: "no_profile" });
          }
          return;
        }
        const data = await fetchCoachAnalytics(COACH_ANALYTICS_PERIOD_DAYS[period]);
        if (!cancelled) {
          setState({ status: "ready", data });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message:
              error instanceof Error ? error.message : t("loadFailed"),
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [period, reloadKey, t]);

  if (state.status === "loading") {
    return <CoachScreenShell title={t("title")} loading />;
  }

  if (state.status === "no_profile") {
    return (
      <CoachScreenShell title={t("title")}>
        <CoachStateCard message={t("noProfile")} />
      </CoachScreenShell>
    );
  }

  if (state.status === "error") {
    return (
      <CoachScreenShell title={t("title")}>
        <CoachStateCard
          message={state.message}
          actionLabel={t("retry")}
          onAction={reload}
        />
      </CoachScreenShell>
    );
  }

  const { totals, classTypeBreakdown, hourlyAttendance } = state.data;
  const hasData =
    totals.sessions > 0 ||
    totals.bookings > 0 ||
    classTypeBreakdown.length > 0;

  const attendanceLabel =
    totals.averageAttendanceRate === null
      ? t("notAvailable")
      : `${Math.round(totals.averageAttendanceRate)}%`;

  const peakLabel =
    totals.peakTime === null
      ? t("notAvailable")
      : formatPeakHourLabel(totals.peakTime.hour, locale);

  const topClassTypes = [...classTypeBreakdown]
    .sort((a, b) => b.attendance - a.attendance)
    .slice(0, 6);

  const topHours = [...hourlyAttendance]
    .filter((row) => row.attendance > 0)
    .sort((a, b) => b.attendance - a.attendance)
    .slice(0, 8);

  return (
    <CoachScreenShell title={t("title")}>
      <View style={styles.periodRow} accessibilityLabel={t("periodAria")}>
        {(["month", "year"] as const).map((value) => {
          const active = period === value;
          return (
            <Pressable
              key={value}
              onPress={() => setPeriod(value)}
              style={[styles.periodChip, active && styles.periodChipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[
                  styles.periodLabel,
                  active && styles.periodLabelActive,
                ]}
              >
                {value === "month" ? t("periodMonth") : t("periodYear")}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!hasData ? (
        <CoachStateCard message={t("empty")} />
      ) : (
        <>
          <Text style={styles.groupTitle}>{t("kpiGroupActivity")}</Text>
          <View style={styles.metrics}>
            <CoachMetricCard
              label={t("totalClassesTaught")}
              value={String(totals.totalClassesTaught)}
            />
            <CoachMetricCard
              label={t("totalClientsTrained")}
              value={String(totals.totalClientsTrained)}
            />
            <CoachMetricCard
              label={t("averageAttendanceRate")}
              value={attendanceLabel}
            />
          </View>

          <Text style={styles.groupTitle}>{t("kpiGroupPerformance")}</Text>
          <View style={styles.metrics}>
            <CoachMetricCard
              label={t("classFillRate")}
              value={`${Math.round(totals.classFillRate)}%`}
            />
            <CoachMetricCard
              label={t("mostPopularClassType")}
              value={totals.mostPopularClassType ?? t("notAvailable")}
            />
            <CoachMetricCard label={t("peakTime")} value={peakLabel} />
          </View>

          <Text style={styles.groupTitle}>{t("classTypeBreakdownTitle")}</Text>
          <Text style={styles.hint}>{t("classTypeBreakdownHint")}</Text>
          {topClassTypes.length === 0 ? (
            <CoachStateCard message={t("empty")} />
          ) : (
            <View style={styles.list}>
              {topClassTypes.map((row) => (
                <View key={row.classTypeId} style={styles.rowCard}>
                  <Text style={styles.rowTitle}>{row.name}</Text>
                  <Text style={styles.rowMeta}>
                    {row.attendance} · {row.sessions} · {row.bookings}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.groupTitle}>{t("peakHoursTitle")}</Text>
          <Text style={styles.hint}>{t("peakHoursHint")}</Text>
          {topHours.length === 0 ? (
            <CoachStateCard message={t("emptyPeakHours")} />
          ) : (
            <View style={styles.list}>
              {topHours.map((row) => (
                <View key={row.hour} style={styles.rowCard}>
                  <Text style={styles.rowTitle}>
                    {formatPeakHourLabel(row.hour, locale)}
                  </Text>
                  <Text style={styles.rowMeta}>{row.attendance}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </CoachScreenShell>
  );
}

const styles = StyleSheet.create({
  periodRow: {
    flexDirection: "row",
    gap: space.xs,
  },
  periodChip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.white,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  periodChipActive: {
    backgroundColor: colors.primaryGreen,
    borderColor: colors.primaryGreen,
  },
  periodLabel: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.secondarySage,
  },
  periodLabelActive: {
    color: colors.creamHighlight,
    fontFamily: fontFamilies.manrope.semiBold,
  },
  groupTitle: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.body,
    color: colors.primaryGreen,
    marginTop: space.xs,
  },
  hint: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.caption,
    color: colors.bodyMuted,
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
  },
  list: {
    gap: space.sm,
  },
  rowCard: {
    borderRadius: radii.labelCard,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: space.md,
    gap: space.xxs,
  },
  rowTitle: {
    fontFamily: fontFamilies.manrope.semiBold,
    fontSize: typography.bodySmall,
    color: colors.primaryGreen,
  },
  rowMeta: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.caption,
    color: colors.bodyMuted,
  },
});
