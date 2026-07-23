import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslations } from "../../../i18n/I18nProvider";
import { fetchCoachSalary } from "../../../lib/api/coachClient";
import { formatAmdFromCents } from "../../../lib/formatAmd";
import { space } from "../../../theme/tokens";
import { CoachMetricCard, CoachStateCard } from "../components/CoachMetricCards";
import { CoachScreenShell } from "../components/CoachScreenShell";
import type { CoachSalarySummary } from "../types/coachPanel";

type LoadState =
  | { status: "loading" }
  | { status: "no_profile" }
  | { status: "error"; message: string }
  | { status: "ready"; salary: CoachSalarySummary };

export function CoachSalaryScreen() {
  const t = useTranslations("coachPages.salary");
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
        const salary = await fetchCoachSalary();
        if (salary === null) {
          if (!cancelled) {
            setState({ status: "no_profile" });
          }
          return;
        }
        if (!cancelled) {
          setState({ status: "ready", salary });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : t("loadFailed", { status: "error" }),
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey, t]);

  if (state.status === "loading") {
    return <CoachScreenShell title={t("title")} showBack loading />;
  }

  if (state.status === "no_profile") {
    return (
      <CoachScreenShell title={t("title")} showBack>
        <CoachStateCard message={t("noProfile")} />
      </CoachScreenShell>
    );
  }

  if (state.status === "error") {
    return (
      <CoachScreenShell title={t("title")} showBack>
        <CoachStateCard
          message={state.message}
          actionLabel={t("retry")}
          onAction={reload}
        />
      </CoachScreenShell>
    );
  }

  const { salary } = state;

  return (
    <CoachScreenShell title={t("title")} showBack>
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
    </CoachScreenShell>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
  },
});
