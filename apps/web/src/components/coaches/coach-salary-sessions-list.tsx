"use client";

import { useEffect, useState } from "react";
import { CoachSalarySessionCard } from "@/components/coaches/coach-salary-session-card";
import { CoachSalarySessionsTable } from "@/components/coaches/coach-salary-sessions-table";
import type { CoachSalarySessionRow, CoachSalarySessionsPayload } from "@/components/coaches/coach-salary-session-types";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { apiFetch } from "@/lib/api";
import { DEFAULT_LIST_PAGE_SIZE } from "@/lib/list-pagination";

type CoachSalarySessionsListProps = {
  /** Endpoint returning {@link CoachSalarySessionsPayload}, e.g. admin or coach-panel salary-sessions route. */
  endpoint: string;
  /** Calendar month (`YYYY-MM`) — used by the coach panel salary page. */
  month?: string;
  /** Inclusive day range — preferred by admin finance coaches. */
  from?: string;
  to?: string;
  locale: string;
  loadingLabel: string;
  loadFailedLabel: string;
  emptyLabel: string;
  /** Spreadsheet layout matching the admin finance drawer; cards remain available for compact UIs. */
  variant?: "cards" | "table";
  totalsLabel?: string;
};

function buildEndpoint(
  endpoint: string,
  range: { month?: string; from?: string; to?: string },
  take: number,
  offset: number,
): string {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
  });
  if (range.from) {
    params.set("from", range.from);
  }
  if (range.to) {
    params.set("to", range.to);
  }
  if (range.month && !range.from && !range.to) {
    params.set("month", range.month);
  }
  return `${endpoint}?${params.toString()}`;
}

/** Paginated per-session salary breakdown, shared by the admin drawer and the coach's own salary page. */
export function CoachSalarySessionsList({
  endpoint,
  month,
  from,
  to,
  locale,
  loadingLabel,
  loadFailedLabel,
  emptyLabel,
  variant = "cards",
  totalsLabel = "Totals",
}: CoachSalarySessionsListProps) {
  const pageSize = DEFAULT_LIST_PAGE_SIZE;
  const [page, setPage] = useState(1);
  const [sessions, setSessions] = useState<CoachSalarySessionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rangeKey = `${month ?? ""}:${from ?? ""}:${to ?? ""}`;
  const [prevKey, setPrevKey] = useState(`${endpoint}:${rangeKey}`);
  const key = `${endpoint}:${rangeKey}`;
  if (key !== prevKey) {
    setPrevKey(key);
    setPage(1);
  }

  useEffect(() => {
    let cancelled = false;
    const offset = (page - 1) * pageSize;

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const payload = await apiFetch<CoachSalarySessionsPayload>(
          buildEndpoint(endpoint, { month, from, to }, pageSize, offset),
        );
        if (!cancelled) {
          setSessions(payload.items);
          setTotal(payload.total);
        }
      } catch {
        if (!cancelled) {
          setError(loadFailedLabel);
          setSessions([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [endpoint, month, from, to, page, pageSize, loadFailedLabel]);

  const listOffset = (page - 1) * pageSize;
  const showRows = !loading && !error && sessions.length > 0;

  return (
    <div className="space-y-3">
      {loading ? <p className="text-sm text-sage-500">{loadingLabel}</p> : null}
      {error ? <p className="text-sm text-red-800">{error}</p> : null}
      {!loading && !error && sessions.length === 0 ? (
        <p className="text-sm text-sage-600">{emptyLabel}</p>
      ) : null}
      {showRows && variant === "table" ? (
        <CoachSalarySessionsTable
          sessions={sessions}
          locale={locale}
          totalsLabel={totalsLabel}
        />
      ) : null}
      {showRows && variant === "cards" ? (
        <ul className="space-y-2">
          {sessions.map((session) => (
            <CoachSalarySessionCard key={session.id} session={session} locale={locale} />
          ))}
        </ul>
      ) : null}
      <OmmListPagination
        total={total}
        page={page}
        pageSize={pageSize}
        offset={listOffset}
        disabled={loading}
        onPageChange={setPage}
        scrollOnPageChange={false}
      />
    </div>
  );
}
