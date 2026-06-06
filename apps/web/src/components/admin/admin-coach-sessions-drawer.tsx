"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_MEDIUM_PANEL_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import type { CoachFinanceRow, CoachSessionRow } from "@/components/admin/admin-finance-types";
import { coachCardDisplayName } from "@/components/coaches/coach-card-display";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { apiFetch } from "@/lib/api";
import { formatDateTimeForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";

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

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await apiFetch<CoachSessionRow[]>(
          `/classes/admin/sessions?coachId=${encodeURIComponent(coach.coachProfileId)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
        );
        if (!cancelled) {
          setSessions(rows);
        }
      } catch {
        if (!cancelled) {
          setError(t("loadFailed"));
          setSessions([]);
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
  }, [coach, month, t]);

  const coachName =
    coach !== null
      ? coachCardDisplayName({
          name: coach.user.name,
          lastName: coach.user.lastName,
          email: coach.user.email,
          avatarUrl: null,
        })
      : "";

  return (
    <OmmDrawerPortal
      isOpen={coach !== null}
      onClose={onClose}
      backdropAriaLabel={t("close")}
      ariaLabelledBy={titleId}
      overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      panelClassName={ADMIN_DETAILS_SHEET_MEDIUM_PANEL_CLASS}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
              {coachName}
            </h2>
            <p className="mt-1 text-sm text-sage-600">{t("monthLabel", { month })}</p>
          </div>
          <OmmButton type="button" variant="ghost" size="sm" onClick={onClose}>
            {t("close")}
          </OmmButton>
        </div>
        <p className="mt-3 text-xs text-sage-500">{t("earningsHint")}</p>
      </header>
      <div className={ADMIN_DETAILS_SHEET_BODY_CLASS}>
        {loading ? <p className="text-sm text-sage-500">{t("loading")}</p> : null}
        {error ? <p className="text-sm text-red-800">{error}</p> : null}
        {!loading && !error && sessions.length === 0 ? (
          <p className="text-sm text-sage-600">{t("empty")}</p>
        ) : null}
        <ul className="space-y-2">
          {sessions.map((session) => {
            const earnings = coach !== null ? sessionEarningsCents(session, coach.salary) : null;
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
    </OmmDrawerPortal>
  );
}
