import { headers } from "next/headers";
import { AdminCoachActions } from "@/components/admin/admin-coach-actions";
import { serverApiJson } from "@/lib/server-api";

type CoachAdminRow = {
  id: string;
  bio: string | null;
  specialization: string | null;
  user: {
    name: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
};

function coachDisplayName(u: CoachAdminRow["user"]): string {
  const s = [u.name, u.lastName].filter(Boolean).join(" ").trim();
  return s.length > 0 ? s : "—";
}

export default async function ManagerCoachesPage() {
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<CoachAdminRow[]>("/coaches/admin/list", cookie);

  if (!res.ok) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {res.status === 401 || res.status === 403
          ? "Manager sign-in required."
          : `Could not load coaches (${res.status}).`}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Coaches</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Directory view for operations. Deactivate/delete coach profiles stay
        admin-only per CRM.
      </p>
      <div className="mt-6 overflow-x-auto rounded-[24px] border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Specialization</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((c) => (
              <tr key={c.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {coachDisplayName(c.user)}
                </td>
                <td className="px-4 py-3 text-zinc-700">{c.user.email}</td>
                <td className="px-4 py-3 text-zinc-700">
                  {c.user.phone ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {c.specialization ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <AdminCoachActions
                    coachId={c.id}
                    initialSpecialization={c.specialization ?? ""}
                    initialBio={c.bio ?? ""}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
