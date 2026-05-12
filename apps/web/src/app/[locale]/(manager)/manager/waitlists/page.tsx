import { headers } from "next/headers";
import { serverApiJson } from "@/lib/server-api";

type WaitlistAdminRow = {
  id: string;
  position: number;
  status: string;
  offeredAt: string | null;
  offerExpiresAt: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  session: { id: string; startsAt: string; classType: { name: string } };
};

export default async function ManagerWaitlistsPage() {
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<WaitlistAdminRow[]>(
    "/waitlist/admin/recent?take=200",
    cookie,
  );

  if (!res.ok) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {res.status === 401 || res.status === 403
          ? "Manager sign-in required."
          : `Could not load waitlists (${res.status}).`}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Waitlists</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Operational view aligned with the CRM manager matrix (move/remove via API
        or future row actions).
      </p>
      <div className="mt-6 overflow-x-auto rounded-[24px] border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Session</th>
              <th className="px-4 py-3">Pos</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Offer expires</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((w) => (
              <tr key={w.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 text-zinc-900">
                  <div className="font-medium">{w.user.name ?? "—"}</div>
                  <div className="text-xs text-zinc-500">{w.user.email}</div>
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  {w.session.classType.name}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {new Date(w.session.startsAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-zinc-600">{w.position}</td>
                <td className="px-4 py-3 text-zinc-600">{w.status}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {w.offerExpiresAt
                    ? new Date(w.offerExpiresAt).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
