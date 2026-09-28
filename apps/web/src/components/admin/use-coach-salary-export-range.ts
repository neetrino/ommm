"use client";

import { useEffect, useState } from "react";
import {
  COACH_SALARY_EXPORT_RANGE_DEBOUNCE_MS,
  salaryExportRangeIssue,
  type SalaryExportRangeIssue,
} from "@/components/admin/admin-coach-salary-export-range";

type SalaryRange = {
  from: string;
  to: string;
};

/** Draft export range that follows the page filters and commits valid edits. */
export function useCoachSalaryExportRange(
  from: string,
  to: string,
  onCommit: (from: string, to: string) => void,
): {
  from: string;
  to: string;
  listFrom: string;
  listTo: string;
  issue: SalaryExportRangeIssue | null;
  setFrom: (value: string) => void;
  setTo: (value: string) => void;
} {
  const [draft, setDraft] = useState<SalaryRange>({ from, to });
  const source = `${from}|${to}`;
  const [prevSource, setPrevSource] = useState(source);
  if (source !== prevSource) {
    setPrevSource(source);
    setDraft({ from, to });
  }

  useEffect(() => {
    if (salaryExportRangeIssue(draft.from, draft.to) !== null) {
      return undefined;
    }
    if (draft.from === from && draft.to === to) {
      return undefined;
    }
    const handle = window.setTimeout(() => {
      onCommit(draft.from, draft.to);
    }, COACH_SALARY_EXPORT_RANGE_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [draft, from, to, onCommit]);

  const issue = salaryExportRangeIssue(draft.from, draft.to);
  return {
    from: draft.from,
    to: draft.to,
    listFrom: issue === null ? draft.from : from,
    listTo: issue === null ? draft.to : to,
    issue,
    setFrom: (value) => setDraft((current) => ({ ...current, from: value })),
    setTo: (value) => setDraft((current) => ({ ...current, to: value })),
  };
}
