import { headers } from "next/headers";
import { serverApiJson } from "@/lib/server-api";

type CoachAdminRow = {
  id: string;
  bio: string | null;
  specialization: string | null;
  user: { name: string | null; email: string };
};

export default async function AdminCoachesPage() {
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<CoachAdminRow[]>("/coaches/admin/list", cookie);

  if (!res.ok) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {res.status === 401 || res.status === 403
          ? "Admin or manager sign-in required."
          : `Could not load coaches (${res.status}).`}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Coaches</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Coach profiles from <code className="text-xs">GET /v1/coaches/admin/list</code>
        . Substitute coach and availability are managed on sessions and profiles.
      </p>
      <div className="mt-6 overflow-x-auto rounded-[24px] border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Specialization</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((c) => (
              <tr key={c.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {c.user.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-700">{c.user.email}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {c.specialization ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
