import { headers } from "next/headers";
import { serverApiJson } from "@/lib/server-api";

type MembershipAdminRow = {
  id: string;
  status: string;
  sessionsRemaining: number | null;
  currentPeriodEnd: string | null;
  plan: { name: string; slug: string };
  user: { id: string; email: string; name: string | null };
};

export default async function AdminMembershipsPage() {
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MembershipAdminRow[]>(
    "/memberships/admin/all",
    cookie,
  );

  if (!res.ok) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {res.status === 401 || res.status === 403
          ? "Studio admin sign-in required for membership billing."
          : `Could not load memberships (${res.status}).`}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">
        Memberships &amp; billing
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Active and historical memberships from{" "}
        <code className="text-xs">GET /v1/memberships/admin/all</code>. Plan
        edits and manual assignment use the API or future forms here.
      </p>
      <div className="mt-6 overflow-x-auto rounded-[24px] border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Sessions left</th>
              <th className="px-4 py-3">Period end</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((m) => (
              <tr key={m.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 text-zinc-900">
                  <div className="font-medium">{m.user.name ?? "—"}</div>
                  <div className="text-xs text-zinc-500">{m.user.email}</div>
                </td>
                <td className="px-4 py-3 text-zinc-700">{m.plan.name}</td>
                <td className="px-4 py-3 text-zinc-600">{m.status}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {m.sessionsRemaining ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {m.currentPeriodEnd
                    ? new Date(m.currentPeriodEnd).toLocaleDateString()
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
