import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useLocale, useTranslations } from "../../../i18n/I18nProvider";
import { formatAmdFromCents } from "../../../lib/formatAmd";
import { fontFamilies } from "../../../theme/fontFamilies";
import { colors, space, typography } from "../../../theme/tokens";
import { CoachMetricCard, CoachStateCard } from "../components/CoachMetricCards";
import { CoachSalaryMonthNav } from "../components/CoachSalaryMonthNav";
import { CoachScreenShell } from "../components/CoachScreenShell";
import { useCoachSalarySummary } from "../hooks/useCoachSalarySummary";
import { currentStudioSalaryMonth } from "../lib/coachSalaryMonth";
import type { CoachSalarySummary } from "../types/coachPanel";

export function CoachSalaryScreen() {
  const locale = useLocale();
  const t = useTranslations("coachPages.salary");
  const [month, setMonth] = useState(() => currentStudioSalaryMonth());
  const { state, reload } = useCoachSalarySummary(month);

  if (state.status === "no_profile") {
    return (
      <CoachScreenShell title={t("title")} showBack>
        <CoachStateCard message={t("noProfile")} />
      </CoachScreenShell>
    );
  }

  return (
    <CoachScreenShell title={t("title")} showBack>
      <Text style={styles.hint}>{t("monthHint")}</Text>
      <CoachSalaryMonthNav
        locale={locale}
        month={month}
        ariaLabel={t("monthAria")}
        prevMonthAria={t("prevMonthAria")}
        nextMonthAria={t("nextMonthAria")}
        onChange={setMonth}
      />
      {state.status === "loading" ? (
        <ActivityIndicator size="large" color={colors.taupe} />
      ) : null}
      {state.status === "error" ? (
        <CoachStateCard
          message={state.message}
          actionLabel={t("retry")}
          onAction={reload}
        />
      ) : null}
      {state.status === "ready" ? <CoachSalaryMetrics salary={state.salary} /> : null}
    </CoachScreenShell>
  );
}

function CoachSalaryMetrics({ salary }: { salary: CoachSalarySummary }) {
  const t = useTranslations("coachPages.salary");
  return (
    <View style={styles.metrics}>
      <CoachMetricCard
        label={t("total")}
        value={formatAmdFromCents(salary.totalEarningsCents)}
      />
      <CoachMetricCard
        label={t("pending")}
        value={formatAmdFromCents(salary.pendingPayoutCents)}
      />
      <CoachMetricCard
        label={t("paid")}
        value={formatAmdFromCents(salary.paidOutCents)}
      />
      <CoachMetricCard
        label={t("sessions")}
        value={String(salary.completedSessions)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontFamily: fontFamilies.manrope.regular,
    fontSize: typography.bodySmall,
    color: colors.bodyMuted,
    lineHeight: 20,
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
  },
});
