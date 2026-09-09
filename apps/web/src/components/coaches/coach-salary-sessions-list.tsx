"use client";

import { useEffect, useState } from "react";
import { CoachSalarySessionCard } from "@/components/coaches/coach-salary-session-card";
import type { CoachSalarySessionRow, CoachSalarySessionsPayload } from "@/components/coaches/coach-salary-session-types";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { apiFetch } from "@/lib/api";
import { DEFAULT_LIST_PAGE_SIZE } from "@/lib/list-pagination";

type CoachSalarySessionsListProps = {
  /** Endpoint returning {@link CoachSalarySessionsPayload}, e.g. admin or coach-panel salary-sessions route. */
  endpoint: string;
  month: string;
  locale: string;
  loadingLabel: string;
  loadFailedLabel: string;
  emptyLabel: string;
};

function buildEndpoint(endpoint: string, month: string, take: number, offset: number): string {
  const params = new URLSearchParams({
    month,
    take: String(take),
    offset: String(offset),
  });
  return `${endpoint}?${params.toString()}`;
}

/** Paginated per-session salary breakdown, shared by the admin drawer and the coach's own salary page. */
export function CoachSalarySessionsList({
  endpoint,
  month,
  locale,
  loadingLabel,
  loadFailedLabel,
  emptyLabel,
}: CoachSalarySessionsListProps) {
  const pageSize = DEFAULT_LIST_PAGE_SIZE;
  const [page, setPage] = useState(1);
  const [sessions, setSessions] = useState<CoachSalarySessionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prevKey, setPrevKey] = useState(`${endpoint}:${month}`);
  const key = `${endpoint}:${month}`;
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
          buildEndpoint(endpoint, month, pageSize, offset),
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
  }, [endpoint, month, page, pageSize, loadFailedLabel]);

  const listOffset = (page - 1) * pageSize;

  return (
    <div className="space-y-3">
      {loading ? <p className="text-sm text-sage-500">{loadingLabel}</p> : null}
      {error ? <p className="text-sm text-red-800">{error}</p> : null}
      {!loading && !error && sessions.length === 0 ? (
        <p className="text-sm text-sage-600">{emptyLabel}</p>
      ) : null}
      <ul className="space-y-2">
        {sessions.map((session) => (
          <CoachSalarySessionCard key={session.id} session={session} locale={locale} />
        ))}
      </ul>
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
