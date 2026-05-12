import { headers } from "next/headers";
import { ACCOUNT_SESSION_RANGE_DAYS } from "@/lib/account-constants";
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

export default async function ManagerClassesPage() {
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
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {typesRes.status === 401 || typesRes.status === 403
          ? "Manager sign-in required."
          : `Could not load class types (${typesRes.status}).`}
      </div>
    );
  }

  if (!sessionsRes.ok) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {sessionsRes.status === 401 || sessionsRes.status === 403
          ? "Manager sign-in required."
          : `Could not load sessions (${sessionsRes.status}).`}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Classes</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Same schedule window as admin ({ACCOUNT_SESSION_RANGE_DAYS} days). Create
        and edit sessions remain in the admin tools when needed.
      </p>
      <h2 className="mt-8 text-lg font-medium text-zinc-900">Class types</h2>
      <div className="mt-4 overflow-x-auto rounded-[24px] border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
            </tr>
          </thead>
          <tbody>
            {typesRes.data.map((t) => (
              <tr key={t.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">{t.name}</td>
                <td className="px-4 py-3 text-zinc-600">{t.slug}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="mt-8 text-lg font-medium text-zinc-900">Upcoming sessions</h2>
      <div className="mt-4 overflow-x-auto rounded-[24px] border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Starts</th>
              <th className="px-4 py-3">Coach</th>
              <th className="px-4 py-3">Booked</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {sessionsRes.data.map((s) => (
              <tr key={s.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {s.classType.name}
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  {new Date(s.startsAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {s.coach.user.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {s._count.bookings}/{s.capacity}
                </td>
                <td className="px-4 py-3 text-zinc-600">{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
