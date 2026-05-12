import { headers } from "next/headers";
import { ACCOUNT_SESSION_RANGE_DAYS } from "@/lib/account-constants";
import type {
  CoachPanelBookingRow,
  CoachPanelSessionRow,
} from "@/lib/coach-panel-types";
import { serverApiJson } from "@/lib/server-api";

type MeResponse = {
  user: { role: string; name: string | null };
  coachProfileId: string | null;
};

export type CoachPanelPageData =
  | { ok: false; reason: "not_signed_in" | "no_coach_profile" | "not_coach_role"; role?: string }
  | {
      ok: true;
      userName: string | null;
      sessions: CoachPanelSessionRow[];
      roster: CoachPanelBookingRow[];
    };

export async function loadCoachPanelPageData(): Promise<CoachPanelPageData> {
  const cookie = (await headers()).get("cookie") ?? "";
  const meRes = await serverApiJson<MeResponse>("/users/me", cookie);
  if (!meRes.ok) {
    return { ok: false, reason: "not_signed_in" };
  }

  if (meRes.data.user.role !== "COACH") {
    return {
      ok: false,
      reason: "not_coach_role",
      role: meRes.data.user.role,
    };
  }

  const coachId = meRes.data.coachProfileId;
  if (!coachId) {
    return { ok: false, reason: "no_coach_profile" };
  }

  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + ACCOUNT_SESSION_RANGE_DAYS);
  const q = `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}&coachId=${encodeURIComponent(coachId)}`;

  const [sessionsRes, bookingsRes] = await Promise.all([
    serverApiJson<CoachPanelSessionRow[]>(`/classes/sessions?${q}`, cookie),
    serverApiJson<CoachPanelBookingRow[]>(`/bookings/admin?${q}`, cookie),
  ]);

  const sessions = sessionsRes.ok ? sessionsRes.data : [];
  const myBookings = (bookingsRes.ok ? bookingsRes.data : []).filter(
    (b) => b.session.coachId === coachId,
  );
  const roster = myBookings.filter((b) => b.status === "BOOKED");

  return {
    ok: true,
    userName: meRes.data.user.name,
    sessions,
    roster,
  };
}
