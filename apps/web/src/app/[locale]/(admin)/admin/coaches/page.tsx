import { headers } from "next/headers";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
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
      <div className="app-alert-warn max-w-xl">
        {res.status === 401 || res.status === 403
          ? "Admin or manager sign-in required."
          : `Could not load coaches (${res.status}).`}
      </div>
    );
  }

  return (
    <AccountPageFrame
      title="Coaches"
      description={
        <>
          Coach profiles from{" "}
          <code className={adminChrome.inlineCode}>GET /v1/coaches/admin/list</code>
          . Substitute coach and availability are managed on sessions and profiles.
        </>
      }
    >
      <div className={`mt-2 ${adminChrome.tableWrap}`}>
        <table className={adminChrome.table}>
          <thead className={adminChrome.thead}>
            <tr>
              <th className={adminChrome.th}>Name</th>
              <th className={adminChrome.th}>Email</th>
              <th className={adminChrome.th}>Specialization</th>
            </tr>
          </thead>
          <tbody>
            {res.data.map((c) => (
              <tr key={c.id} className={adminChrome.tr}>
                <td className={adminChrome.tdStrong}>{c.user.name ?? "—"}</td>
                <td className={adminChrome.td}>{c.user.email}</td>
                <td className={adminChrome.td}>
                  {c.specialization ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AccountPageFrame>
  );
}
