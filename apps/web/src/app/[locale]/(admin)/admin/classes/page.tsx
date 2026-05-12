import { headers } from "next/headers";
import { ACCOUNT_SESSION_RANGE_DAYS } from "@/lib/account-constants";
import { adminChrome } from "@/components/admin/admin-chrome";
import {
  AccountPageFrame,
  AccountSection,
} from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type ClassTypeRow = {
  id: string;
  name: string;
  slug: string;
};

type SessionRow = {
  id: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  status: string;
  classType: { name: string };
  coach: { user: { name: string | null } };
  _count: { bookings: number };
};

export default async function AdminClassesPage() {
  const cookie = (await headers()).get("cookie") ?? "";
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + ACCOUNT_SESSION_RANGE_DAYS);
  const q = `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`;

  const [typesRes, sessionsRes] = await Promise.all([
    serverApiJson<ClassTypeRow[]>("/classes/types", cookie),
    serverApiJson<SessionRow[]>(`/classes/sessions?${q}`, cookie),
  ]);

  if (!typesRes.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {typesRes.status === 401 || typesRes.status === 403
          ? "Admin or manager sign-in required for class types."
          : `Could not load class types (${typesRes.status}).`}
      </div>
    );
  }

  if (!sessionsRes.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {sessionsRes.status === 401 || sessionsRes.status === 403
          ? "Admin or manager sign-in required for sessions."
          : `Could not load sessions (${sessionsRes.status}).`}
      </div>
    );
  }

  return (
    <AccountPageFrame
      title="Classes"
      description={`Class types and published sessions in the next ${ACCOUNT_SESSION_RANGE_DAYS} days (calendar-style month/week views can build on this data).`}
    >
      <AccountSection title="Class types">
        <div className={adminChrome.tableWrap}>
          <table className={adminChrome.table}>
            <thead className={adminChrome.thead}>
              <tr>
                <th className={adminChrome.th}>Name</th>
                <th className={adminChrome.th}>Slug</th>
              </tr>
            </thead>
            <tbody>
              {typesRes.data.map((t) => (
                <tr key={t.id} className={adminChrome.tr}>
                  <td className={adminChrome.tdStrong}>{t.name}</td>
                  <td className={adminChrome.td}>{t.slug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AccountSection>

      <AccountSection title="Upcoming sessions" className="mt-8">
        <div className={adminChrome.tableWrap}>
          <table className={adminChrome.table}>
            <thead className={adminChrome.thead}>
              <tr>
                <th className={adminChrome.th}>Class</th>
                <th className={adminChrome.th}>Starts</th>
                <th className={adminChrome.th}>Coach</th>
                <th className={adminChrome.th}>Booked</th>
                <th className={adminChrome.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sessionsRes.data.map((s) => (
                <tr key={s.id} className={adminChrome.tr}>
                  <td className={adminChrome.tdStrong}>
                    {s.classType.name}
                  </td>
                  <td className={adminChrome.td}>
                    {new Date(s.startsAt).toLocaleString()}
                  </td>
                  <td className={adminChrome.td}>
                    {s.coach.user.name ?? "—"}
                  </td>
                  <td className={adminChrome.td}>
                    {s._count.bookings}/{s.capacity}
                  </td>
                  <td className={adminChrome.td}>{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AccountSection>
    </AccountPageFrame>
  );
}
