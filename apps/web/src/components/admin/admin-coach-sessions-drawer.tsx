"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api";
import { formatDateTimeForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import { coachCardDisplayName } from "@/components/coaches/coach-card-display";
import type { CoachFinanceRow, CoachSessionRow } from "@/components/admin/admin-finance-types";
import { OmmButton } from "@/components/ui/omm-button";

type Props = {
  coach: CoachFinanceRow | null;
  locale: string;
  month: string;
  onClose: () => void;
};

function monthBounds(month: string): { from: string; to: string } {
  const [yearText, monthText] = month.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const from = new Date(Date.UTC(year, monthIndex, 1));
  const to = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));
  return { from: from.toISOString(), to: to.toISOString() };
}

function sessionEarningsCents(
  session: CoachSessionRow,
  salary: CoachFinanceRow["salary"],
): number | null {
  if (!salary) {
    return null;
  }
  const attendees = session._count?.bookings ?? 0;
  if (attendees === 0) {
    return null;
  }
  return salary.basePerSessionCents + attendees * salary.perAttendeeShareCents;
}

export function AdminCoachSessionsDrawer({ coach, locale, month, onClose }: Props) {
  const t = useTranslations("adminPages.finance.coachDrawer");
  const titleId = useId();
  const [sessions, setSessions] = useState<CoachSessionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coach) {
      return undefined;
    }
    let cancelled = false;
    const { from, to } = monthBounds(month);
    setLoading(true);
    setError(null);
    void apiFetch<CoachSessionRow[]>(
      `/classes/admin/sessions?coachId=${encodeURIComponent(coach.coachProfileId)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    )
      .then((rows) => {
        if (!cancelled) {
          setSessions(rows);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(t("loadFailed"));
          setSessions([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [coach, month, t]);

  useEffect(() => {
    if (!coach) {
      return undefined;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [coach, onClose]);

  if (!coach || typeof document === "undefined") {
    return null;
  }

  const coachName = coachCardDisplayName({
    name: coach.user.name,
    lastName: coach.user.lastName,
    email: coach.user.email,
    avatarUrl: null,
  });

  return createPortal(
    <div className="ommm-drawer-overlay z-[70]">
      <button
        type="button"
        className="ommm-modal-backdrop"
        aria-label={t("close")}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-labelledby={titleId}
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-white/60 bg-white/95 p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-sage-900">
              {coachName}
            </h2>
            <p className="mt-1 text-sm text-sage-600">{t("monthLabel", { month })}</p>
          </div>
          <OmmButton type="button" variant="ghost" size="sm" onClick={onClose}>
            {t("close")}
          </OmmButton>
        </div>
        <p className="mt-3 text-xs text-sage-500">{t("earningsHint")}</p>
        <div className="mt-4 flex-1 overflow-y-auto">
          {loading ? <p className="text-sm text-sage-500">{t("loading")}</p> : null}
          {error ? <p className="text-sm text-red-800">{error}</p> : null}
          {!loading && !error && sessions.length === 0 ? (
            <p className="text-sm text-sage-600">{t("empty")}</p>
          ) : null}
          <ul className="space-y-2">
            {sessions.map((session) => {
              const earnings = sessionEarningsCents(session, coach.salary);
              return (
                <li
                  key={session.id}
                  className="rounded-2xl border border-sage-100 bg-white p-3 text-sm"
                >
                  <p className="font-medium text-sage-900">
                    {formatDateTimeForUi(session.startsAt, locale)}
                  </p>
                  <p className="mt-1 text-sage-600">{session.classType.name}</p>
                  <p className="mt-1 text-xs text-sage-500">
                    {earnings !== null
                      ? t("attribution", {
                          amount: formatAmdFromCents(earnings, locale),
                        })
                      : t("noAttribution")}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
