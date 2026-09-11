import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "../../../i18n/I18nProvider";
import { fetchCoachSalary } from "../../../lib/api/coachClient";
import type { CoachSalarySummary } from "../types/coachPanel";

export type CoachSalaryLoadState =
  | { status: "loading" }
  | { status: "no_profile" }
  | { status: "error"; message: string }
  | { status: "ready"; salary: CoachSalarySummary };

export function useCoachSalarySummary(month: string): {
  state: CoachSalaryLoadState;
  reload: () => void;
} {
  const t = useTranslations("coachPages.salary");
  const [state, setState] = useState<CoachSalaryLoadState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => {
    setReloadKey((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    void (async () => {
      try {
        const salary = await fetchCoachSalary(month);
        if (cancelled) {
          return;
        }
        setState(
          salary === null
            ? { status: "no_profile" }
            : { status: "ready", salary },
        );
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
  }, [month, reloadKey, t]);

  return { state, reload };
}
