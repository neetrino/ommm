import { useCallback, useEffect, useState } from "react";
import {
  fetchCoachAccountMe,
  fetchCoachRoster,
  fetchCoachSalary,
  fetchCoachSessions,
} from "../../../lib/api/coachClient";
import type {
  CoachAccountMe,
  CoachPanelBookingRow,
  CoachPanelSessionRow,
  CoachSalarySummary,
} from "../types/coachPanel";

export type CoachPanelLoadState =
  | { status: "loading" }
  | { status: "no_profile" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      account: CoachAccountMe;
      sessions: CoachPanelSessionRow[];
      roster: CoachPanelBookingRow[];
      salary: CoachSalarySummary | null;
    };

type UseCoachPanelDataOptions = {
  includeRoster?: boolean;
  includeSalary?: boolean;
};

export function useCoachPanelData(
  options: UseCoachPanelDataOptions = {},
): {
  state: CoachPanelLoadState;
  reload: () => void;
} {
  const includeRoster = options.includeRoster !== false;
  const includeSalary = options.includeSalary === true;
  const [state, setState] = useState<CoachPanelLoadState>({ status: "loading" });
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
        const coachId = account.coachProfileId;
        if (coachId === null || coachId.length === 0) {
          if (!cancelled) {
            setState({ status: "no_profile" });
          }
          return;
        }

        const [sessions, roster, salary] = await Promise.all([
          fetchCoachSessions(coachId),
          includeRoster ? fetchCoachRoster(coachId) : Promise.resolve([]),
          includeSalary ? fetchCoachSalary() : Promise.resolve(null),
        ]);

        if (!cancelled) {
          setState({
            status: "ready",
            account,
            sessions,
            roster,
            salary,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message:
              error instanceof Error ? error.message : "Could not load coach data",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [includeRoster, includeSalary, reloadKey]);

  return { state, reload };
}
