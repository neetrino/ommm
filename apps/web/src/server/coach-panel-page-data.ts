import { cache } from "react";
import { ACCOUNT_SESSION_RANGE_DAYS } from "@/lib/account-constants";
import type {
  CoachPanelBookingRow,
  CoachPanelSessionRow,
} from "@/lib/coach-panel-types";
import { serverApiJson } from "@/lib/server-api";
import { getSessionAuth } from "@/server/require-role-layout";

export type CoachPanelDataScope = "full" | "sessions" | "roster";

export type CoachPanelPageData =
  | { ok: false; reason: "not_signed_in" | "no_coach_profile" | "not_coach_role"; role?: string }
  | {
      ok: true;
      userName: string | null;
      sessions: CoachPanelSessionRow[];
      roster: CoachPanelBookingRow[];
    };

function sessionRangeQuery(coachId: string): string {
  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + ACCOUNT_SESSION_RANGE_DAYS);
  return `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}&coachId=${encodeURIComponent(coachId)}`;
}

const loadCoachSessions = cache(async (coachId: string, cookie: string) => {
  const q = sessionRangeQuery(coachId);
  const res = await serverApiJson<CoachPanelSessionRow[]>(`/classes/sessions?${q}`, cookie);
  return res.ok ? res.data : [];
});

const loadCoachRoster = cache(async (coachId: string, cookie: string) => {
  const q = sessionRangeQuery(coachId);
  const res = await serverApiJson<CoachPanelBookingRow[]>(`/bookings/admin?${q}`, cookie);
  if (!res.ok) {
    return [];
  }
  const myBookings = res.data.filter((b) => b.session.coachId === coachId);
  return myBookings.filter((b) => b.status === "BOOKED");
});

/**
 * Coach panel data — one `/users/me` via {@link getSessionAuth}; sessions/roster cached per request.
 * Use scope to avoid fetching both endpoints on every coach subpage.
 */
export const loadCoachPanelPageData = cache(
  async (scope: CoachPanelDataScope = "full"): Promise<CoachPanelPageData> => {
    const session = await getSessionAuth();
    if (!session.ok) {
      return { ok: false, reason: "not_signed_in" };
    }

    if (session.user.role !== "COACH") {
      return {
        ok: false,
        reason: "not_coach_role",
        role: session.user.role,
      };
    }

    const coachId = session.coachProfileId;
    if (coachId === null || coachId.length === 0) {
      return { ok: false, reason: "no_coach_profile" };
    }

    const needsSessions = scope === "full" || scope === "sessions";
    const needsRoster = scope === "full" || scope === "roster";

    const [sessions, roster] = await Promise.all([
      needsSessions ? loadCoachSessions(coachId, session.cookie) : Promise.resolve([]),
      needsRoster ? loadCoachRoster(coachId, session.cookie) : Promise.resolve([]),
    ]);

    return {
      ok: true,
      userName: session.user.name ?? null,
      sessions,
      roster,
    };
  },
);
