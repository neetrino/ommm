import { headers } from "next/headers";
import { MarkAttendanceButtons } from "@/components/coach/mark-attendance-buttons";
import { ACCOUNT_SESSION_RANGE_DAYS } from "@/lib/account-constants";
import { formatSessionRange } from "@/lib/format-session-time";
import { serverApiJson } from "@/lib/server-api";

type MeResponse = {
  user: { role: string; name: string | null };
  coachProfileId: string | null;
};

type SessionRow = {
  id: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  classType: { name: string };
  coachId: string;
  _count: { bookings: number };
};

type BookingAdminRow = {
  id: string;
  status: string;
  user: { name: string | null; email: string };
  session: {
    id: string;
    startsAt: string;
    endsAt: string;
    coachId: string;
    classType: { name: string };
  };
};

export default async function CoachHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookie = (await headers()).get("cookie") ?? "";

  const meRes = await serverApiJson<MeResponse>("/users/me", cookie);
  if (!meRes.ok) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Sign in to open the coach panel.
      </div>
    );
  }

  const coachId = meRes.data.coachProfileId;
  const isCoach =
    meRes.data.user.role === "COACH" || coachId != null;

  if (!isCoach || !coachId) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-700">
        This area is for studio coaches. Your account does not have a coach
        profile.
      </div>
    );
  }

  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + ACCOUNT_SESSION_RANGE_DAYS);
  const q = `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}&coachId=${encodeURIComponent(coachId)}`;

  const [sessionsRes, bookingsRes] = await Promise.all([
    serverApiJson<SessionRow[]>(`/classes/sessions?${q}`, cookie),
    serverApiJson<BookingAdminRow[]>(
      `/bookings/admin?${q}`,
      cookie,
    ),
  ]);

  const sessions = sessionsRes.ok ? sessionsRes.data : [];
  const myBookings = (bookingsRes.ok ? bookingsRes.data : []).filter(
    (b) => b.session.coachId === coachId,
  );
  const roster = myBookings.filter((b) => b.status === "BOOKED");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-indigo-950">
          Hi{meRes.data.user.name ? `, ${meRes.data.user.name}` : ""}
        </h1>
        <p className="mt-2 text-sm text-indigo-900/80">
          Your upcoming sessions and live roster.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-medium text-indigo-950">My schedule</h2>
        {sessions.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600">No sessions in range.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="rounded-xl border border-indigo-100 bg-white p-4 text-sm shadow-sm"
              >
                <p className="font-medium text-zinc-900">
                  {s.classType.name}
                </p>
                <p className="text-zinc-600">
                  {formatSessionRange(locale, s.startsAt, s.endsAt)}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {s._count.bookings}/{s.capacity} booked
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium text-indigo-950">
          Attendance (booked)
        </h2>
        {roster.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600">No active bookings.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {roster.map((b) => (
              <li
                key={b.id}
                className="flex flex-col gap-3 rounded-xl border border-indigo-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-zinc-900">
                    {b.user.name ?? b.user.email}
                  </p>
                  <p className="text-sm text-zinc-600">
                    {b.session.classType.name} ·{" "}
                    {formatSessionRange(
                      locale,
                      b.session.startsAt,
                      b.session.endsAt,
                    )}
                  </p>
                </div>
                <MarkAttendanceButtons bookingId={b.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
